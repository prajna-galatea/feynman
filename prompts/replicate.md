---
description: Plan or execute a replication workflow for a paper, claim, or benchmark.
args: <paper>
section: Research Workflows
topLevelCli: true
---
Design a replication plan for: $@

## Workflow

1. **Extract** — Use the `researcher` subagent to pull implementation details from the target paper and any linked code. If `CHANGELOG.md` exists, read the most recent relevant entries before planning or resuming.
2. **Plan** — Determine what code, datasets, metrics, and environment are needed. Be explicit about what is verified, what is inferred, what is still missing, and which checks or test oracles will be used to decide whether the replication succeeded.
3. **Environment** — Before running anything, ask the user where to execute:
   - **Local** — run in the current working directory
   - **Virtual environment** — create an isolated venv/conda env first
   - **Docker** — run experiment code inside an isolated Docker container
   - **Modal** — run on Modal's serverless GPU infrastructure. Write a Modal-decorated Python script and execute with `modal run <script.py>`. Best for burst GPU jobs that don't need persistent state. Requires `modal` CLI (`pip install modal && modal setup`).
   - **RunPod** — provision a GPU pod on RunPod and SSH in for execution. Use `runpodctl` to create pods, transfer files, and manage lifecycle. Best for long-running experiments or when you need SSH access and persistent storage. Requires `runpodctl` CLI and `RUNPOD_API_KEY`.
   - **Plan only** — produce the replication plan without executing
4. **Execute** — If the user chose an execution environment, implement and run the replication steps there. Save notes, scripts, raw outputs, and results to disk in a reproducible layout. Do not call the outcome replicated unless the planned checks actually passed.
5. **Log** — For multi-step or resumable replication work, append concise entries to `CHANGELOG.md` after meaningful progress, failed attempts, major verification outcomes, and before stopping. Record the active objective, what changed, what was checked, and the next step.
6. **Report** — End with a `Sources` section containing paper and repository URLs.

Do not install packages, run training, or execute experiments without confirming the execution environment first.

## 語言設定（繁體中文 / zh-TW）

使用者為繁體中文使用者。請以**繁體中文（zh-TW）**回答所有使用者可見的文字，包含敘述、摘要、分析、結論、表格標題與引言。

- 程式碼、檔名、CLI 指令、API 名稱、路徑與 URL 保持原文，不翻譯。
- 引用段落保留原文，可在需要時附上繁中譯文。
- 專有名詞與論文／工具名稱維持英文原稱，必要時以括號附上繁中解釋。
- 本節僅規範輸出語言，不覆寫或修改此檔其他原始設定。
