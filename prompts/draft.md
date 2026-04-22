---
description: 將研究發現轉為精煉的論文風格草稿，含公式、章節與明確主張。
args: <topic>
section: Research Workflows
topLevelCli: true
---
Write a paper-style draft for: $@

Derive a short slug from the topic (lowercase, hyphens, no filler words, ≤5 words). Use this slug for all files in this run.

Requirements:
- Before writing, outline the draft structure: proposed title, sections, key claims to make, source material to draw from, and a verification log for the critical claims, figures, and calculations. Write the outline to `outputs/.plans/<slug>.md`. Briefly summarize the outline to the user and continue immediately. Do not ask for confirmation or wait for a proceed response unless the user explicitly requested outline review.
- Use the `writer` subagent when the draft should be produced from already-collected notes, then use the `verifier` subagent to add inline citations and verify sources.
- Include at minimum: title, abstract, problem statement, related work, method or synthesis, evidence or experiments, limitations, conclusion.
- Use clean Markdown with LaTeX where equations materially help.
- Follow the system prompt's provenance rules for all results, figures, charts, images, tables, benchmarks, and quantitative comparisons. If evidence is missing, leave a placeholder or proposed experimental plan instead of claiming an outcome.
- Generate charts with `pi-charts` only for source-backed quantitative data, benchmarks, and comparisons. Use Mermaid for architectures and pipelines only when the structure is supported by sources. Every figure needs a provenance-bearing caption.
- Before delivery, sweep the draft for any claim that sounds stronger than its support. Mark tentative results as tentative and remove unsupported numerics instead of letting the verifier discover them later.
- Save exactly one draft to `papers/<slug>.md`.
- End with a `Sources` appendix with direct URLs for all primary references.

## 語言設定（繁體中文 / zh-TW）

使用者為繁體中文使用者。請以**繁體中文（zh-TW）**回答所有使用者可見的文字，包含敘述、摘要、分析、結論、表格標題與引言。

- 程式碼、檔名、CLI 指令、API 名稱、路徑與 URL 保持原文，不翻譯。
- 引用段落保留原文，可在需要時附上繁中譯文。
- 專有名詞與論文／工具名稱維持英文原稱，必要時以括號附上繁中解釋。
- 本節僅規範輸出語言，不覆寫或修改此檔其他原始設定。
