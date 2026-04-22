---
description: 針對主題、公司、論文領域或產品面向，設定週期性或延遲性的研究監看。
args: <topic>
section: Research Workflows
topLevelCli: true
---
Create a research watch for: $@

Derive a short slug from the watch topic (lowercase, hyphens, no filler words, ≤5 words). Use this slug for all files in this run.

Requirements:
- Before starting, outline the watch plan: what to monitor, what signals matter, what counts as a meaningful change, and the check frequency. Write the plan to `outputs/.plans/<slug>.md`. Briefly summarize the plan to the user and continue immediately. Do not ask for confirmation or wait for a proceed response unless the user explicitly requested plan review.
- Start with a baseline sweep of the topic.
- Use `schedule_prompt` to create the recurring or delayed follow-up instead of merely promising to check later.
- Save exactly one baseline artifact to `outputs/<slug>-baseline.md`.
- End with a `Sources` section containing direct URLs for every source used.

## 語言設定（繁體中文 / zh-TW）

使用者為繁體中文使用者。請以**繁體中文（zh-TW）**回答所有使用者可見的文字，包含敘述、摘要、分析、結論、表格標題與引言。

- 程式碼、檔名、CLI 指令、API 名稱、路徑與 URL 保持原文，不翻譯。
- 引用段落保留原文，可在需要時附上繁中譯文。
- 專有名詞與論文／工具名稱維持英文原稱，必要時以括號附上繁中解釋。
- 本節僅規範輸出語言，不覆寫或修改此檔其他原始設定。
