---
description: 自主實驗迴圈——嘗試想法、量測結果、保留可行方案、捨棄失效方案，循環往復。
args: <idea>
section: Research Workflows
topLevelCli: true
---
Start an autoresearch optimization loop for: $@

This command uses pi-autoresearch.

## Step 1: Gather

If `autoresearch.md` and `autoresearch.jsonl` already exist, ask the user if they want to resume or start fresh.
If `CHANGELOG.md` exists, read the most recent relevant entries before resuming.

Otherwise, collect the following from the user before doing anything else:
- What to optimize (test speed, bundle size, training loss, build time, etc.)
- The benchmark command to run
- The metric name, unit, and direction (lower/higher is better)
- Files in scope for changes
- Maximum number of iterations (default: 20)

## Step 2: Environment

Ask the user where to run:
- **Local** — run in the current working directory
- **New git branch** — create a branch so main stays clean
- **Virtual environment** — create an isolated venv/conda env first
- **Docker** — run experiment code inside an isolated Docker container
- **Modal** — run on Modal's serverless GPU infrastructure. Write Modal-decorated scripts and execute with `modal run`. Best for GPU-heavy benchmarks with no persistent state between iterations. Requires `modal` CLI.
- **RunPod** — provision a GPU pod via `runpodctl` and run iterations there over SSH. Best for experiments needing persistent state, large datasets, or SSH access between iterations. Requires `runpodctl` CLI.

Do not proceed without a clear answer.

## Step 3: Confirm

Present the full plan to the user before starting:

```
Optimization target: [metric] ([direction])
Benchmark command:   [command]
Files in scope:      [files]
Environment:         [chosen environment]
Max iterations:      [N]
```

Ask the user to confirm. Do not start the loop without explicit approval.

## Step 4: Run

Initialize the session: create `autoresearch.md`, `autoresearch.sh`, run the baseline, and start looping.

Each iteration: edit → commit → `run_experiment` → `log_experiment` → keep or revert → repeat. Do not stop unless interrupted or `maxIterations` is reached.
After the baseline and after meaningful iteration milestones, append a concise entry to `CHANGELOG.md` summarizing what changed, what metric result was observed, what failed, and the next step.

## Key tools

- `init_experiment` — one-time session config (name, metric, unit, direction)
- `run_experiment` — run the benchmark command, capture output and wall-clock time
- `log_experiment` — record result, auto-commit, update dashboard

## Subcommands

- `/autoresearch <text>` — start or resume the loop
- `/autoresearch off` — stop the loop, keep data
- `/autoresearch clear` — delete all state and start fresh

## 語言設定（繁體中文 / zh-TW）

使用者為繁體中文使用者。請以**繁體中文（zh-TW）**回答所有使用者可見的文字，包含敘述、摘要、分析、結論、表格標題與引言。

- 程式碼、檔名、CLI 指令、API 名稱、路徑與 URL 保持原文，不翻譯。
- 引用段落保留原文，可在需要時附上繁中譯文。
- 專有名詞與論文／工具名稱維持英文原稱，必要時以括號附上繁中解釋。
- 本節僅規範輸出語言，不覆寫或修改此檔其他原始設定。
