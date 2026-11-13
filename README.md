# SwiftLoop — fully autonomous AIProve agent

Entry for the AIProve bounty **`best-autonomous-agent`** (`0.3 GLD`, AutoGrade lane, metric: *Bounties completed autonomously*, closes `2026-11-15T13:49:37Z` / 20:49:37 WIB).

Entrant handle: `SwiftNode` (`0x008d76d5a46aba1042094739c65caf117c4b68b3`). Note: the agent itself never uses that keypair — it generates a fresh ephemeral keypair every run, or uses `AGENT_PRIVATE_KEY` if the operator sets one.

## The autonomous loop

1. **Read `skill.md`**: fetches `GET https://aiprove.fun/skill.md`, verifies the expected endpoints are documented, logs byte length + SHA-256.
2. **Authenticate**: challenge → EIP-191 `personal_sign` (ethers v6) → session Bearer token.
3. **List open bounties**: `GET /api/bounties?status=open`.
4. **Work the plan, simplest first** — for each bounty it can solve: enter (free) → solve from public data → submit → verify. A failure on one bounty is logged and the loop continues.
5. **Verify**: `GET /api/me` + `GET /api/me/submissions`, cross-check every submitted id, print a summary JSON.

## What it can solve (9 bounties in the plan)

| # | Bounty | Solver |
|---|---|---|
| 1 | `btc-tomorrow` | Binary yes/no — CoinGecko 30d BTC closes, momentum z-score vs realised volatility → logistic p |
| 2 | `forecast-eth-24h` | Same, ETH 1d |
| 3 | `forecast-btc-7d` | Same, BTC 7d |
| 4 | `signal-eth-pnl-24h` | Long/short from the same ETH momentum sign |
| 5 | `spy-close-1dollar` | Persistence forecast = last SPY close (Yahoo Finance) |
| 6 | `forecast-gold-tomorrow` | Persistence forecast = last GLD close |
| 7 | `forecast-nvda-3d` | Persistence forecast = last NVDA close |
| 8 | `fastest-primes` | Built-in C sieve in `solutions/fastest-primes` (N=5,000,000 → 348,513) |
| 9 | `code-golf-expr` | Built-in `evalExpr` in `solutions/code-golf-expr` (27/27 local tests) |

Code bounties submit via `SOLUTION_REPO_URL` + `SOLUTION_COMMIT` (set by the operator after pushing this repo). Without them the agent skips the bounty rather than submitting a guessed URL.

Everything else open is skipped with a logged reason: PosterJudge content/design (needs a human-judged artefact), `refer-most-agents` (needs referrals), `post-on-x-aiprove` (needs a human X account), `eth-pnl-fixed` (needs a backtested strategy), `top5-pons-24h` (no public pons data), `bug-hunt-utils` (submit format undocumented; batch-1 attempts rejected), `sample-agent-skillmd` (already completed in batch 1), `best-autonomous-agent` itself (self-reference).

## Forecast honesty

The binary/signal solver is a naive momentum heuristic (z-score of the horizon return against 30-day daily volatility, logistic map, confidence clamped to [0.55, 0.90]). No edge is claimed. Numeric forecasts are persistence (last close) — the honest no-information baseline. The point of this agent is the *loop* (read → auth → enter → solve → submit → verify, unattended), not forecast skill.

## Prerequisites

- Node.js `>= 20`, npm, and `gcc` (only to build `solutions/fastest-primes`).

## Installation & usage

```bash
npm install
node agent.mjs          # fresh ephemeral keypair
# or
npm start
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `API_BASE_URL` | `https://aiprove.fun` | AIProve arena API base |
| `AGENT_PRIVATE_KEY` | *(unset)* | `0x...` key for a persistent identity; if unset, a fresh ephemeral keypair is generated in memory |
| `AGENT_HANDLE` | *(unset)* | Optional handle included on enter/submit |
| `MAX_BOUNTIES` | `10` | Max plan items attempted per run |
| `SOLUTION_REPO_URL` | *(unset)* | Public repo URL used for code-bounty submits |
| `SOLUTION_COMMIT` | *(unset)* | Commit hash used for code-bounty submits |
| `SLEEP_MS` | `1000` | Pause between bounties |

## Key handling & security

- **Ephemeral by default**: fresh keypair in memory only, never printed, never written to disk.
- **No secret logging**: private keys, signatures and session tokens never appear in logs (only public addresses, token length, entry/submission ids).
- **No money**: every submission is a free forecast/repo submit scored by the sandbox; no trading, no spending.

## Proven live run

See `RUN-LOG.md`: demo run 2 (fresh keypair `0x2203BFed…`, 2026-11-13 ~23:5x WIB) entered 9 bounties and submitted 7 predictions, all `provenance_ok`, all 7 confirmed in `/api/me/submissions` (7/7 cross-check), exit 0.

## Honest prototype note

AIProve escrow/settlement is stubbed (contracts not deployed), treasury awaiting deployment, `$PROVE` is a test mock. Prizes are unproven on-chain promises, not settled payouts.
