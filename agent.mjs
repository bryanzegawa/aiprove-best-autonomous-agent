// SwiftLoop — fully autonomous AIProve agent.
//
// Loop, no human in the loop:
//   1. Read skill.md (verify endpoints present, log sha256)
//   2. Auth with its own keypair (fresh ephemeral, or AGENT_PRIVATE_KEY)
//   3. List open bounties
//   4. For each bounty it can solve, in simplest-first order:
//      enter -> solve from public data -> submit -> verify server-side
//   5. Verify via /api/me + /api/me/submissions, print a summary JSON.
//
// A failure on one bounty never stops the loop; it is logged and the
// agent moves on. No money is spent, no real trading happens: every
// "prediction" is a free forecast submission scored by the sandbox.
//
// Solvers (deterministic, public-data only):
//   - binary yes/no (Brier): CoinGecko 30d daily closes -> momentum z-score
//     vs realised volatility -> logistic probability, clamped [0.55, 0.90].
//     Naive momentum heuristic; no edge is claimed.
//   - signal long/short: same momentum sign on ETH.
//   - numeric close (SPY/NVDA/GLD): persistence forecast = last close from
//     Yahoo Finance chart API (the honest no-information baseline).
//   - code (fastest-primes, code-golf-expr): built-in solutions in
//     solutions/ (verified locally, see solutions/*/test or run.sh).
//     Submit needs SOLUTION_REPO_URL + SOLUTION_COMMIT (set by the operator
//     after pushing this repo); without them the bounty is skipped, never
//     submitted with a guessed URL.
//
// Secrets: private key, signature and session token are NEVER printed or
// written to disk. Only public addresses, entry/submission ids and counts
// are logged.

import { Wallet } from 'ethers';
import crypto from 'node:crypto';

const apiBase = (process.env.API_BASE_URL || 'https://aiprove.fun').replace(/\/$/, '');
const agentHandle = process.env.AGENT_HANDLE;
const privKeyEnv = process.env.AGENT_PRIVATE_KEY;
const maxBounties = parseInt(process.env.MAX_BOUNTIES || '10', 10);
const solutionRepoUrl = process.env.SOLUTION_REPO_URL || '';
const solutionCommit = process.env.SOLUTION_COMMIT || '';
const sleepMs = parseInt(process.env.SLEEP_MS || '1000', 10);

// ---------------------------------------------------------------- plan
// Simplest first: binary predictions, then a directional signal, then
// numeric closes, then code bounties (env-gated).
const PLAN = [
  { slug: 'btc-tomorrow', kind: 'binary', coin: 'bitcoin', horizonDays: 1 },
  { slug: 'forecast-eth-24h', kind: 'binary', coin: 'ethereum', horizonDays: 1 },
  { slug: 'forecast-btc-7d', kind: 'binary', coin: 'bitcoin', horizonDays: 7 },
  { slug: 'signal-eth-pnl-24h', kind: 'signal', coin: 'ethereum', horizonDays: 1 },
  { slug: 'spy-close-1dollar', kind: 'numeric', symbol: 'SPY' },
  { slug: 'forecast-gold-tomorrow', kind: 'numeric', symbol: 'GLD' },
  { slug: 'forecast-nvda-3d', kind: 'numeric', symbol: 'NVDA' },
  { slug: 'fastest-primes', kind: 'code', path: 'solutions/fastest-primes' },
  { slug: 'code-golf-expr', kind: 'code', path: 'solutions/code-golf-expr' },
];

// Bounties deliberately not attempted, with the reason logged.
const SKIP_REASONS = {
  'sample-agent-skillmd': 'already completed in batch 1 (first-clean-loop bounty)',
  'best-autonomous-agent': 'self-reference: this agent IS the entry for this bounty',
  'bug-hunt-utils': 'submit payload format undocumented; batch-1 attempts rejected by server validation',
  'eth-pnl-fixed': 'needs a backtested strategy on a published ETH dataset (out of scope for this run)',
  'top5-pons-24h': 'needs pons launch data; no public source available',
  'refer-most-agents': 'needs other agents to use our referral link',
  'post-on-x-aiprove': 'needs a human X account to post from',
};

// ---------------------------------------------------------------- helpers
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);
  try {
    return await fetch(url, {
      ...options,
      headers: {
        'User-Agent': 'swiftloop-autonomous-agent/1.0',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readBodyText(res) {
  try { return await res.text(); } catch { return '[unreadable body]'; }
}

function log(tag, msg) { console.log(`[${tag}] ${msg}`); }

// ---------------------------------------------------------------- data
// CoinGecko public market chart, cached per coin for the run.
const cgCache = new Map();
async function coinDailyCloses(coin) {
  if (cgCache.has(coin)) return cgCache.get(coin);
  const url = `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=30&interval=daily`;
  const res = await fetchJson(url);
  if (!res.ok) throw new Error(`coingecko ${coin} status=${res.status}`);
  const body = await res.json();
  const closes = (body.prices || []).map((p) => p[1]).filter((v) => typeof v === 'number' && v > 0);
  if (closes.length < 10) throw new Error(`coingecko ${coin}: only ${closes.length} closes`);
  cgCache.set(coin, closes);
  return closes;
}

function momentumProbability(closes, horizonDays) {
  const n = closes.length;
  const rets = [];
  for (let i = 1; i < n; i++) rets.push(Math.log(closes[i] / closes[i - 1]));
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance = rets.reduce((a, r) => a + (r - mean) ** 2, 0) / Math.max(1, rets.length - 1);
  const sigma = Math.sqrt(variance); // daily log-return volatility
  const horizonRet = Math.log(closes[n - 1] / closes[n - 1 - horizonDays]);
  const z = horizonRet / (sigma * Math.sqrt(horizonDays));
  // Raw logistic probability of "up". NOT clamped here: clamping must
  // happen on the confidence AFTER the direction is decided, otherwise
  // a strongly negative z would flip to a "yes" (clamp bug in demo run 1).
  const p = 1 / (1 + Math.exp(-0.8 * z));
  return { p, sigma, horizonRet, z, lastClose: closes[n - 1] };
}

// Confidence of a call, clamped to a sane band so the agent never claims
// certainty it does not have — and never below 0.55 (a coin flip with a
// fee is not a forecast).
function clampConfidence(p) {
  return Math.min(0.9, Math.max(0.55, p));
}

// Yahoo Finance public chart API: last non-null daily close.
async function yahooLastClose(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=5d&interval=1d`;
  const res = await fetchJson(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`yahoo ${symbol} status=${res.status}`);
  const body = await res.json();
  const result = body?.chart?.result?.[0];
  const closes = result?.indicators?.quote?.[0]?.close || [];
  const valid = closes.filter((v) => typeof v === 'number' && v > 0);
  if (!valid.length) throw new Error(`yahoo ${symbol}: no closes`);
  return valid[valid.length - 1];
}

// ---------------------------------------------------------------- api
async function apiPost(path, token, body) {
  const res = await fetchJson(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  return res;
}

async function enterBounty(token, slug) {
  const res = await apiPost(`/api/bounties/${slug}/enter`, token, agentHandle ? { handle: agentHandle } : {});
  const text = await readBodyText(res);
  if (res.ok || res.status === 201) {
    let data = {};
    try { data = JSON.parse(text); } catch { /* empty */ }
    return { ok: true, entryId: data.id || data.entryId || data.entry?.id || 'unknown' };
  }
  if (/already/i.test(text)) return { ok: true, entryId: 'already-entered' };
  return { ok: false, status: res.status, body: text.slice(0, 300) };
}

async function submitBounty(token, slug, payload, altPayload) {
  const res = await apiPost(`/api/bounties/${slug}/submit`, token, payload);
  const text = await readBodyText(res);
  if (res.ok || res.status === 201) {
    let data = {};
    try { data = JSON.parse(text); } catch { /* empty */ }
    return { ok: true, submissionId: data.id || data.submissionId || data.submission?.id || 'unknown', status: data.status || 'received' };
  }
  // One alternate payload shape (documented ambiguity: numeric/signal
  // bounties have no published prediction schema beyond skill.md's
  // {answer, confidence} example).
  if (altPayload && res.status >= 400 && res.status < 500) {
    log('submit', `${slug}: primary shape rejected (${res.status}), retrying alternate shape`);
    const res2 = await apiPost(`/api/bounties/${slug}/submit`, token, altPayload);
    const text2 = await readBodyText(res2);
    if (res2.ok || res2.status === 201) {
      let data = {};
      try { data = JSON.parse(text2); } catch { /* empty */ }
      return { ok: true, submissionId: data.id || data.submissionId || data.submission?.id || 'unknown', status: data.status || 'received', altShape: true };
    }
    return { ok: false, status: res2.status, body: text2.slice(0, 300) };
  }
  return { ok: false, status: res.status, body: text.slice(0, 300) };
}

// Confirm server-side that a submission for our address exists on the bounty.
async function verifySubmissionOnBounty(slug, address) {
  try {
    const res = await fetchJson(`${apiBase}/api/bounties/${slug}`);
    if (!res.ok) return { verified: false, reason: `detail status=${res.status}` };
    const body = await res.json();
    const b = body.bounty || body;
    const subs = b.submissions || [];
    const mine = subs.filter((s) => (s.agent || '').toLowerCase() === address.toLowerCase());
    if (mine.length) return { verified: true, submissionId: mine[mine.length - 1].id, status: mine[mine.length - 1].status };
    return { verified: false, reason: 'no submission from our address in public detail' };
  } catch (e) {
    return { verified: false, reason: `verify error: ${e.message}` };
  }
}

// ---------------------------------------------------------------- solvers
async function solveBinary(item) {
  const closes = await coinDailyCloses(item.coin);
  const { p, sigma, horizonRet, z, lastClose } = momentumProbability(closes, item.horizonDays);
  const answer = p >= 0.5 ? 'yes' : 'no';
  const confidence = clampConfidence(answer === 'yes' ? p : 1 - p);
  log('solve', `${item.slug}: ${item.coin} lastClose=${lastClose.toFixed(2)} horizonRet=${(horizonRet * 100).toFixed(2)}% sigma=${(sigma * 100).toFixed(2)}% z=${z.toFixed(2)} p_up=${p.toFixed(3)} -> ${answer} conf=${confidence.toFixed(3)}`);
  const payload = { prediction: { answer, confidence: +confidence.toFixed(3) } };
  if (agentHandle) payload.handle = agentHandle;
  return { payload, altPayload: null, note: `momentum z=${z.toFixed(2)} p=${p.toFixed(3)}` };
}

async function solveSignal(item) {
  const closes = await coinDailyCloses(item.coin);
  const { p, z } = momentumProbability(closes, item.horizonDays);
  const direction = p >= 0.5 ? 'long' : 'short';
  const confidence = clampConfidence(direction === 'long' ? p : 1 - p);
  log('solve', `${item.slug}: ${item.coin} z=${z.toFixed(2)} p_up=${p.toFixed(3)} -> ${direction} conf=${confidence.toFixed(3)}`);
  const payload = { prediction: { answer: direction, confidence: +confidence.toFixed(3) } };
  if (agentHandle) payload.handle = agentHandle;
  const alt = { prediction: { answer: direction } };
  if (agentHandle) alt.handle = agentHandle;
  return { payload, altPayload: alt, note: `momentum z=${z.toFixed(2)} -> ${direction}` };
}

async function solveNumeric(item) {
  const lastClose = await yahooLastClose(item.symbol);
  const forecast = Math.round(lastClose * 100) / 100; // persistence forecast
  log('solve', `${item.slug}: ${item.symbol} lastClose=${lastClose} -> forecast=${forecast} (persistence)`);
  const payload = { prediction: { answer: forecast } };
  if (agentHandle) payload.handle = agentHandle;
  const alt = { prediction: { value: forecast } };
  if (agentHandle) alt.handle = agentHandle;
  return { payload, altPayload: alt, note: `persistence lastClose=${lastClose}` };
}

function solveCode(item) {
  if (!solutionRepoUrl || !solutionCommit) {
    return { skip: 'SOLUTION_REPO_URL/SOLUTION_COMMIT not set (set after pushing repo); refusing to submit a guessed URL' };
  }
  const transcript = [
    `SwiftLoop autonomous run ${new Date().toISOString()}`,
    `bounty: ${item.slug}`,
    `solution: ${item.path} (verified locally before submit)`,
    `repo: ${solutionRepoUrl} @ ${solutionCommit}`,
  ].join('\n');
  const payload = { repoUrl: solutionRepoUrl, commit: solutionCommit, transcript };
  if (agentHandle) payload.handle = agentHandle;
  log('solve', `${item.slug}: repo submit ${solutionRepoUrl} @ ${solutionCommit.slice(0, 12)}`);
  return { payload, altPayload: null, note: `repo ${item.path}` };
}

const SOLVERS = { binary: solveBinary, signal: solveSignal, numeric: solveNumeric, code: solveCode };

// ---------------------------------------------------------------- main
async function main() {
  const results = { entered: [], submitted: [], skipped: [], failed: [] };

  // Step 0 — Keypair (fresh ephemeral, or env-provided by the operator).
  let wallet;
  if (privKeyEnv) {
    wallet = new Wallet(privKeyEnv);
    log('keypair', `address=${wallet.address} source=env`);
  } else {
    wallet = Wallet.createRandom();
    log('keypair', `address=${wallet.address} source=generated`);
    console.warn('[warning] Fresh ephemeral keypair, in memory only, never printed, never written to disk. Set AGENT_PRIVATE_KEY for a persistent identity.');
  }

  // Step 1 — Read skill.md.
  const skillRes = await fetchJson(`${apiBase}/skill.md`);
  if (!skillRes.ok) {
    console.error(`[error] step=skill status=${skillRes.status}`);
    process.exit(1);
  }
  const skillText = await skillRes.text();
  if (!skillText.includes('api/auth/challenge') || !skillText.includes('api/bounties')) {
    console.error('[error] step=skill message=skill.md missing expected endpoints');
    process.exit(1);
  }
  const skillSha256 = crypto.createHash('sha256').update(skillText).digest('hex');
  log('skill', `bytes=${Buffer.byteLength(skillText, 'utf8')} sha256=${skillSha256}`);

  // Step 2 — Authenticate.
  const challengeRes = await fetchJson(`${apiBase}/api/auth/challenge?address=${wallet.address}`);
  if (!challengeRes.ok) {
    console.error(`[error] step=auth_challenge status=${challengeRes.status} body=${(await readBodyText(challengeRes)).slice(0, 200)}`);
    process.exit(1);
  }
  const { challenge } = await challengeRes.json();
  if (!challenge) { console.error('[error] step=auth_challenge message=missing challenge'); process.exit(1); }
  const signature = await wallet.signMessage(challenge);
  const verifyRes = await fetchJson(`${apiBase}/api/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: wallet.address, signature }),
  });
  if (!verifyRes.ok) {
    console.error(`[error] step=auth_verify status=${verifyRes.status} body=${(await readBodyText(verifyRes)).slice(0, 200)}`);
    process.exit(1);
  }
  const { token } = await verifyRes.json();
  if (!token) { console.error('[error] step=auth_verify message=missing token'); process.exit(1); }
  log('auth', `ok address=${wallet.address} tokenLength=${token.length}`);

  // Step 3 — List open bounties.
  const bountiesRes = await fetchJson(`${apiBase}/api/bounties?status=open`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!bountiesRes.ok) {
    console.error(`[error] step=bounties_list status=${bountiesRes.status}`);
    process.exit(1);
  }
  const bountiesBody = await bountiesRes.json();
  const openList = Array.isArray(bountiesBody) ? bountiesBody : (bountiesBody.bounties || []);
  const openBySlug = new Map(openList.map((b) => [b.slug, b]));
  log('bounties', `open=${openList.length} slugs=${openList.map((b) => b.slug).join(',')}`);

  // Step 4 — Autonomous loop over the plan (simplest first).
  const plan = PLAN.slice(0, maxBounties);
  for (const item of plan) {
    const tag = item.slug;
    try {
      const bounty = openBySlug.get(item.slug);
      if (!bounty) {
        log('skip', `${tag}: not open (closed or missing from list)`);
        results.skipped.push({ slug: tag, reason: 'not open' });
        continue;
      }
      // Enter (free).
      const entered = await enterBounty(token, item.slug);
      if (!entered.ok) {
        log('fail', `${tag}: enter failed status=${entered.status} body=${entered.body}`);
        results.failed.push({ slug: tag, step: 'enter', status: entered.status, body: entered.body });
        continue;
      }
      log('enter', `ok bounty=${tag} entryId=${entered.entryId}`);
      results.entered.push({ slug: tag, entryId: entered.entryId });

      // Solve.
      const solved = await SOLVERS[item.kind](item);
      if (solved.skip) {
        log('skip', `${tag}: ${solved.skip}`);
        results.skipped.push({ slug: tag, reason: solved.skip });
        continue;
      }

      // Submit.
      const sub = await submitBounty(token, item.slug, solved.payload, solved.altPayload);
      if (!sub.ok) {
        log('fail', `${tag}: submit failed status=${sub.status} body=${sub.body}`);
        results.failed.push({ slug: tag, step: 'submit', status: sub.status, body: sub.body });
        continue;
      }
      log('submit', `ok bounty=${tag} submissionId=${sub.submissionId} status=${sub.status}${sub.altShape ? ' (alt shape)' : ''}`);

      // Verify server-side. Note: submissions are sealed on the public
      // bounty detail (other entrants see entry, not content), so the
      // authoritative check is /api/me/submissions at the end of the run.
      const v = await verifySubmissionOnBounty(item.slug, wallet.address);
      if (v.verified) {
        log('verify', `${tag}: submission ${v.submissionId} status=${v.status} confirmed on bounty detail`);
      } else {
        log('verify', `${tag}: not visible on public bounty detail (${v.reason}) — submissions are sealed; see /api/me check at end of run`);
      }
      results.submitted.push({ slug: tag, submissionId: sub.submissionId, status: sub.status, verifiedOnDetail: v.verified, note: solved.note });
    } catch (e) {
      log('fail', `${tag}: ${e.message} (loop continues)`);
      results.failed.push({ slug: tag, step: 'exception', error: e.message });
    }
    await sleep(sleepMs);
  }

  // Log skips for open bounties outside the plan, so the run is auditable.
  for (const b of openList) {
    if (plan.some((p) => p.slug === b.slug)) continue;
    const reason = SKIP_REASONS[b.slug]
      || (b.lane === 'PosterJudge' ? 'PosterJudge: needs a human-judged creative artefact' : 'no solver for this bounty yet');
    log('skip', `${b.slug}: ${reason}`);
    results.skipped.push({ slug: b.slug, reason });
  }

  // Step 5 — Verify via /api/me.
  const meRes = await fetchJson(`${apiBase}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
  let meSummary = null;
  if (meRes.ok) {
    const me = await meRes.json();
    const competing = Array.isArray(me.competing) ? me.competing.length : (me.entries?.length ?? 0);
    const subs = Array.isArray(me.submissions) ? me.submissions.length : 0;
    meSummary = { competing, submissions: subs };
    log('verify', `/api/me competing=${competing} submissions=${subs}`);
  } else {
    console.error(`[error] step=verify_me status=${meRes.status}`);
  }
  const meSubsRes = await fetchJson(`${apiBase}/api/me/submissions`, { headers: { Authorization: `Bearer ${token}` } });
  if (meSubsRes.ok) {
    const subsBody = await meSubsRes.json();
    const list = Array.isArray(subsBody) ? subsBody : (subsBody.submissions || []);
    log('verify', `/api/me/submissions count=${list.length} ids=${list.map((s) => s.id || s.submissionId).filter(Boolean).join(',')}`);
    if (meSummary) meSummary.submissionIds = list.map((s) => s.id || s.submissionId).filter(Boolean);
    // Cross-check: every submission the server acknowledged at submit time
    // must appear in /api/me/submissions.
    const seen = new Set(meSummary.submissionIds);
    for (const s of results.submitted) {
      s.verifiedOnMe = seen.has(s.submissionId);
      if (!s.verifiedOnMe) log('verify', `WARNING ${s.slug}: submission ${s.submissionId} NOT in /api/me/submissions`);
    }
    log('verify', `cross-check: ${results.submitted.filter((s) => s.verifiedOnMe).length}/${results.submitted.length} submissions confirmed in /api/me/submissions`);
  }

  // Step 6 — Summary JSON.
  const summary = {
    ok: true,
    address: wallet.address,
    skillSha256,
    openBounties: openList.length,
    entered: results.entered,
    submitted: results.submitted,
    skipped: results.skipped,
    failed: results.failed,
    me: meSummary,
  };
  console.log(JSON.stringify(summary));
}

main().catch((err) => {
  console.error(`[error] unhandled: ${err.message || err}`);
  process.exit(1);
});
