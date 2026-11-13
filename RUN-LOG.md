# Live run log — SwiftLoop autonomous agent (demo keypairs, NOT SwiftNode)

## Demo run 2 (corrected) — 2026-11-13 ~23:56 WIB (16:56 UTC), exit 0

Command: `node agent.mjs` (no `AGENT_PRIVATE_KEY`, no `AGENT_HANDLE`, no `SOLUTION_REPO_URL`/`SOLUTION_COMMIT` — fresh ephemeral keypair).

Demo address: `0x2203BFed7305eb38f5e4F7F95Bb22d5a55710e86`

```
[keypair] address=0x2203BFed7305eb38f5e4F7F95Bb22d5a55710e86 source=generated
[warning] Fresh ephemeral keypair, in memory only, never printed, never written to disk. Set AGENT_PRIVATE_KEY for a persistent identity.
[skill] bytes=6754 sha256=e75460dcae691a89f5222e1a6b3ff9b98948a11ce2399130bd66ac092277b4e4
[auth] ok address=0x2203BFed7305eb38f5e4F7F95Bb22d5a55710e86 tokenLength=142
[bounties] open=21 slugs=write-article-aiprove,make-art-aiprove,make-meme-aiprove,refer-most-agents,post-on-x-aiprove,btc-tomorrow,eth-pnl-fixed,aiprove-mascot,explainer-video-aiprove,sample-agent-skillmd,forecast-btc-7d,spy-close-1dollar,top5-pons-24h,forecast-eth-24h,forecast-nvda-3d,signal-eth-pnl-24h,forecast-gold-tomorrow,code-golf-expr,fastest-primes,bug-hunt-utils,best-autonomous-agent
[enter] ok bounty=btc-tomorrow entryId=3496d8b7-cf3f-47a4-9769-4c9123a804bd
[solve] btc-tomorrow: bitcoin lastClose=68591.18 horizonRet=-3.97% sigma=2.00% z=-1.98 p_up=0.170 -> no conf=0.830
[submit] ok bounty=btc-tomorrow submissionId=e63a03e6-b46b-48d2-b01e-5bc5680e63c4 status=provenance_ok
[verify] btc-tomorrow: not visible on public bounty detail (no submission from our address in public detail) — submissions are sealed; see /api/me check at end of run
[enter] ok bounty=forecast-eth-24h entryId=3f42c652-a742-4bec-98df-5832eb413a5f
[solve] forecast-eth-24h: ethereum lastClose=1927.32 horizonRet=-4.57% sigma=2.65% z=-1.73 p_up=0.201 -> no conf=0.799
[submit] ok bounty=forecast-eth-24h submissionId=c22b0bac-5b3c-44e7-acae-f1ad58eead69 status=provenance_ok
[verify] forecast-eth-24h: not visible on public bounty detail (no submission from our address in public detail) — submissions are sealed; see /api/me check at end of run
[enter] ok bounty=forecast-btc-7d entryId=f814db7d-0e80-4cb2-a32f-9e56f2ab9deb
[solve] forecast-btc-7d: bitcoin lastClose=68591.18 horizonRet=-9.96% sigma=2.00% z=-1.88 p_up=0.182 -> no conf=0.818
[submit] ok bounty=forecast-btc-7d submissionId=fc0a6757-3406-4b7b-ba3f-37bc9617464e status=provenance_ok
[verify] forecast-btc-7d: not visible on public bounty detail (no submission from our address in public detail) — submissions are sealed; see /api/me check at end of run
[enter] ok bounty=signal-eth-pnl-24h entryId=14a0a973-d070-4e88-89f8-67f8737f55b7
[solve] signal-eth-pnl-24h: ethereum z=-1.73 p_up=0.201 -> short conf=0.799
[submit] ok bounty=signal-eth-pnl-24h submissionId=977ac2e0-78e2-4430-b002-5793e652d453 status=provenance_ok
[verify] signal-eth-pnl-24h: not visible on public bounty detail (no submission from our address in public detail) — submissions are sealed; see /api/me check at end of run
[enter] ok bounty=spy-close-1dollar entryId=d88503bc-a7ad-4718-973f-d7edebdfbdf2
[solve] spy-close-1dollar: SPY lastClose=749.9199829101562 -> forecast=749.92 (persistence)
[submit] ok bounty=spy-close-1dollar submissionId=3d6ef4b1-223c-4655-aacf-035509f62376 status=provenance_ok
[verify] spy-close-1dollar: not visible on public bounty detail (no submission from our address in public detail) — submissions are sealed; see /api/me check at end of run
[enter] ok bounty=forecast-gold-tomorrow entryId=c8ceafa9-c203-4cfd-8b5c-914a4d3f7bd0
[solve] forecast-gold-tomorrow: GLD lastClose=355.44000244140625 -> forecast=355.44 (persistence)
[submit] ok bounty=forecast-gold-tomorrow submissionId=0b7638eb-3ac1-42b4-8e52-c3edf28d3ad7 status=provenance_ok
[verify] forecast-gold-tomorrow: not visible on public bounty detail (no submission from our address in public detail) — submissions are sealed; see /api/me check at end of run
[enter] ok bounty=forecast-nvda-3d entryId=d8e6fe92-095b-44ff-905b-b81920470f09
[solve] forecast-nvda-3d: NVDA lastClose=159.9499969482422 -> forecast=159.95 (persistence)
[submit] ok bounty=forecast-nvda-3d submissionId=c2220f24-8759-4be5-8530-b37568e98b14 status=provenance_ok
[verify] forecast-nvda-3d: not visible on public bounty detail (no submission from our address in public detail) — submissions are sealed; see /api/me check at end of run
[enter] ok bounty=fastest-primes entryId=e5543a46-493c-4fe7-a735-351301b55dd3
[skip] fastest-primes: SOLUTION_REPO_URL/SOLUTION_COMMIT not set (set after pushing repo); refusing to submit a guessed URL
[enter] ok bounty=code-golf-expr entryId=a0d36214-d244-4614-b04c-a2a87811bba0
[skip] code-golf-expr: SOLUTION_REPO_URL/SOLUTION_COMMIT not set (set after pushing repo); refusing to submit a guessed URL
[skip] write-article-aiprove: PosterJudge: needs a human-judged creative artefact
[skip] make-art-aiprove: PosterJudge: needs a human-judged creative artefact
[skip] make-meme-aiprove: PosterJudge: needs a human-judged creative artefact
[skip] refer-most-agents: needs other agents to use our referral link
[skip] post-on-x-aiprove: needs a human X account to post from
[skip] eth-pnl-fixed: needs a backtested strategy on a published ETH dataset (out of scope for this run)
[skip] aiprove-mascot: PosterJudge: needs a human-judged creative artefact
[skip] explainer-video-aiprove: PosterJudge: needs a human-judged creative artefact
[skip] sample-agent-skillmd: already completed in batch 1 (first-clean-loop bounty)
[skip] top5-pons-24h: needs pons launch data; no public source available
[skip] bug-hunt-utils: submit payload format undocumented; batch-1 attempts rejected by server validation
[skip] best-autonomous-agent: self-reference: this agent IS the entry for this bounty
[verify] /api/me competing=9 submissions=7
[verify] /api/me/submissions count=7 ids=e63a03e6-b46b-48d2-b01e-5bc5680e63c4,c22b0bac-5b3c-44e7-acae-f1ad58eead69,fc0a6757-3406-4b7b-ba3f-37bc9617464e,977ac2e0-78e2-4430-b002-5793e652d453,3d6ef4b1-223c-4655-aacf-035509f62376,0b7638eb-3ac1-42b4-8e52-c3edf28d3ad7,c2220f24-8759-4be5-8530-b37568e98b14
[verify] cross-check: 7/7 submissions confirmed in /api/me/submissions
{"ok":true,"address":"0x2203BFed7305eb38f5e4F7F95Bb22d5a55710e86","skillSha256":"e75460dcae691a89f5222e1a6b3ff9b98948a11ce2399130bd66ac092277b4e4","openBounties":21,"entered":[{"slug":"btc-tomorrow","entryId":"3496d8b7-cf3f-47a4-9769-4c9123a804bd"},{"slug":"forecast-eth-24h","entryId":"3f42c652-a742-4bec-98df-5832eb413a5f"},{"slug":"forecast-btc-7d","entryId":"f814db7d-0e80-4cb2-a32f-9e56f2ab9deb"},{"slug":"signal-eth-pnl-24h","entryId":"14a0a973-d070-4e88-89f8-67f8737f55b7"},{"slug":"spy-close-1dollar","entryId":"d88503bc-a7ad-4718-973f-d7edebdfbdf2"},{"slug":"forecast-gold-tomorrow","entryId":"c8ceafa9-c203-4cfd-8b5c-914a4d3f7bd0"},{"slug":"forecast-nvda-3d","entryId":"d8e6fe92-095b-44ff-905b-b81920470f09"},{"slug":"fastest-primes","entryId":"e5543a46-493c-4fe7-a735-351301b55dd3"},{"slug":"code-golf-expr","entryId":"a0d36214-d244-4614-b04c-a2a87811bba0"}],"submitted":[{"slug":"btc-tomorrow","submissionId":"e63a03e6-b46b-48d2-b01e-5bc5680e63c4","status":"provenance_ok","verifiedOnDetail":false,"note":"momentum z=-1.98 p=0.170","verifiedOnMe":true},{"slug":"forecast-eth-24h","submissionId":"c22b0bac-5b3c-44e7-acae-f1ad58eead69","status":"provenance_ok","verifiedOnDetail":false,"note":"momentum z=-1.73 p=0.201","verifiedOnMe":true},{"slug":"forecast-btc-7d","submissionId":"fc0a6757-3406-4b7b-ba3f-37bc9617464e","status":"provenance_ok","verifiedOnDetail":false,"note":"momentum z=-1.88 p=0.182","verifiedOnMe":true},{"slug":"signal-eth-pnl-24h","submissionId":"977ac2e0-78e2-4430-b002-5793e652d453","status":"provenance_ok","verifiedOnDetail":false,"note":"momentum z=-1.73 -> short","verifiedOnMe":true},{"slug":"spy-close-1dollar","submissionId":"3d6ef4b1-223c-4655-aacf-035509f62376","status":"provenance_ok","verifiedOnDetail":false,"note":"persistence lastClose=749.9199829101562","verifiedOnMe":true},{"slug":"forecast-gold-tomorrow","submissionId":"0b7638eb-3ac1-42b4-8e52-c3edf28d3ad7","status":"provenance_ok","verifiedOnDetail":false,"note":"persistence lastClose=355.44000244140625","verifiedOnMe":true},{"slug":"forecast-nvda-3d","submissionId":"c2220f24-8759-4be5-8530-b37568e98b14","status":"provenance_ok","verifiedOnDetail":false,"note":"persistence lastClose=159.9499969482422","verifiedOnMe":true}],"skipped":[{"slug":"fastest-primes","reason":"SOLUTION_REPO_URL/SOLUTION_COMMIT not set (set after pushing repo); refusing to submit a guessed URL"},{"slug":"code-golf-expr","reason":"SOLUTION_REPO_URL/SOLUTION_COMMIT not set (set after pushing repo); refusing to submit a guessed URL"},{"slug":"write-article-aiprove","reason":"PosterJudge: needs a human-judged creative artefact"},{"slug":"make-art-aiprove","reason":"PosterJudge: needs a human-judged creative artefact"},{"slug":"make-meme-aiprove","reason":"PosterJudge: needs a human-judged creative artefact"},{"slug":"refer-most-agents","reason":"needs other agents to use our referral link"},{"slug":"post-on-x-aiprove","reason":"needs a human X account to post from"},{"slug":"eth-pnl-fixed","reason":"needs a backtested strategy on a published ETH dataset (out of scope for this run)"},{"slug":"aiprove-mascot","reason":"PosterJudge: needs a human-judged creative artefact"},{"slug":"explainer-video-aiprove","reason":"PosterJudge: needs a human-judged creative artefact"},{"slug":"sample-agent-skillmd","reason":"already completed in batch 1 (first-clean-loop bounty)"},{"slug":"top5-pons-24h","reason":"needs pons launch data; no public source available"},{"slug":"bug-hunt-utils","reason":"submit payload format undocumented; batch-1 attempts rejected by server validation"},{"slug":"best-autonomous-agent","reason":"self-reference: this agent IS the entry for this bounty"}],"failed":[],"me":{"competing":9,"submissions":7,"submissionIds":["e63a03e6-b46b-48d2-b01e-5bc5680e63c4","c22b0bac-5b3c-44e7-acae-f1ad58eead69","fc0a6757-3406-4b7b-ba3f-37bc9617464e","977ac2e0-78e2-4430-b002-5793e652d453","3d6ef4b1-223c-4655-aacf-035509f62376","0b7638eb-3ac1-42b4-8e52-c3edf28d3ad7","c2220f24-8759-4be5-8530-b37568e98b14"]}}
```

## Independent server-side verification (run 2)

`GET /api/me` after the run: `competing=9, submissions=7`.
`GET /api/me/submissions`: all 7 submission ids returned by the submit calls
are present — cross-check 7/7:

| Bounty | Entry id | Submission id | Status |
|---|---|---|---|
| btc-tomorrow | 3496d8b7-cf3f-47a4-9769-4c9123a804bd | e63a03e6-b46b-48d2-b01e-5bc5680e63c4 | provenance_ok |
| forecast-eth-24h | 3f42c652-a742-4bec-98df-5832eb413a5f | c22b0bac-5b3c-44e7-acae-f1ad58eead69 | provenance_ok |
| forecast-btc-7d | f814db7d-0e80-4cb2-a32f-9e56f2ab9deb | fc0a6757-3406-4b7b-ba3f-37bc9617464e | provenance_ok |
| signal-eth-pnl-24h | 14a0a973-d070-4e88-89f8-67f8737f55b7 | 977ac2e0-78e2-4430-b002-5793e652d453 | provenance_ok |
| spy-close-1dollar | d88503bc-a7ad-4718-973f-d7edebdfbdf2 | 3d6ef4b1-223c-4655-aacf-035509f62376 | provenance_ok |
| forecast-gold-tomorrow | c8ceafa9-c203-4cfd-8b5c-914a4d3f7bd0 | 0b7638eb-3ac1-42b4-8e52-c3edf28d3ad7 | provenance_ok |
| forecast-nvda-3d | d8e6fe92-095b-44ff-905b-b81920470f09 | c2220f24-8759-4be5-8530-b37568e98b14 | provenance_ok |

Predictions submitted (all computed from public data in-run):
- btc-tomorrow: `no`, conf 0.830 (BTC z=-1.98, p_up=0.170)
- forecast-eth-24h: `no`, conf 0.799 (ETH z=-1.73, p_up=0.201)
- forecast-btc-7d: `no`, conf 0.818 (BTC 7d z=-1.88, p_up=0.182)
- signal-eth-pnl-24h: `short`, conf 0.799
- spy-close-1dollar: 749.92 (SPY last close 749.92, persistence)
- forecast-gold-tomorrow: 355.44 (GLD last close 355.44, persistence)
- forecast-nvda-3d: 159.95 (NVDA last close 159.95, persistence)

Payload shapes accepted by the server on first attempt (no alt-shape retry
needed): binary `{prediction:{answer:"yes"|"no", confidence}}`, signal
`{prediction:{answer:"long"|"short", confidence}}`, numeric
`{prediction:{answer:<number>}}`.

Note: submissions are sealed on the public bounty detail — `GET
/api/bounties/<slug>` does not list them — so `/api/me/submissions` is the
authoritative server-side confirmation, and the agent cross-checks it.

## Demo run 1 (superseded — clamp bug found and fixed) — 2026-11-13 ~23:54 WIB, exit 0

Demo address: `0x0940Ff108Afb3db37973c712Af4f8c83867FDaA7`. Same 7 submissions,
all `provenance_ok`, also 7/7 in `/api/me/submissions` — BUT the forecast
directions were wrong: `momentumProbability` clamped p into [0.55, 0.90]
*before* the direction was decided, so a strongly negative z (-1.98)
became p=0.55 and the agent submitted `yes`/`long` when momentum said the
opposite. The bug was caught by reading the run log, fixed (raw p decides
direction; clamp applies to confidence only, via `clampConfidence`), and
the loop was re-run as run 2 with a fresh demo keypair. Run 1 submissions
remain on the server under the single-use demo address and are abandoned;
they are not part of this entry's evidence.

## Secret scan

Both raw logs scanned for `0x` + 64 hex chars (private key) and JWT-shaped
tokens: none found. Only public demo addresses, entry/submission ids and
counts appear. Demo private keys existed in process memory only and were
never printed or written anywhere; both demo identities are single-use.

## What this proves / does not prove

- PROVES: SwiftLoop runs the full autonomous loop against the live API with
  no human in the loop (read skill.md → challenge/sign/verify → list open
  bounties → enter 9 → solve 7 from public data → submit 7 →
  verify 7/7 via /api/me), exit 0, and a per-bounty failure never stops
  the loop (code bounties skipped cleanly when SOLUTION_* env is unset).
- PROVES: the two code solutions bundled in `solutions/` are correct
  locally (code-golf-expr 27/27 tests; fastest-primes N=5,000,000 →
  348,513, N=10 → 4, N=100 → 25). Their *server* submit path is NOT yet
  proven live — it needs SOLUTION_REPO_URL + SOLUTION_COMMIT after the
  repo is pushed, and the operator (parent) runs it then.
- DOES NOT PROVE: any forecast edge — momentum/persistence are naive
  baselines. The graded "bounties completed autonomously" is decided by
  the sandbox + submission order; 29 submissions already exist on
  best-autonomous-agent, most `provenance_ok`.
- DOES NOT PROVE: the final submission under the SwiftNode identity
  (that submit step is deliberately NOT done here — see RESULT-GEMINI.md).
