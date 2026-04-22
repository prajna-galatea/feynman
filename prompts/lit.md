---
description: 針對主題進行文獻回顧，結合論文搜尋與原始資料綜整。
args: <topic>
section: Research Workflows
topLevelCli: true
---
Investigate the following topic as a literature review: $@

Derive a short slug from the topic (lowercase, hyphens, no filler words, ≤5 words). Use this slug for all files in this run.

## Workflow

1. **Plan** — Outline the scope: key questions, source types to search (papers, web, repos), time period, expected sections, and a small task ledger plus verification log. Write the plan to `outputs/.plans/<slug>.md`. Briefly summarize the plan to the user and continue immediately. Do not ask for confirmation or wait for a proceed response unless the user explicitly requested plan review.
2. **Gather** — Use the `researcher` subagent when the sweep is wide enough to benefit from delegated paper triage before synthesis. For narrow topics, search directly. Researcher outputs go to `<slug>-research-*.md`. Do not silently skip assigned questions; mark them `done`, `blocked`, or `superseded`.
3. **Synthesize** — Separate consensus, disagreements, and open questions. When useful, propose concrete next experiments or follow-up reading. Generate charts with `pi-charts` for quantitative comparisons across papers and Mermaid diagrams for taxonomies or method pipelines. Before finishing the draft, sweep every strong claim against the verification log and downgrade anything that is inferred or single-source critical.
4. **Cite** — Spawn the `verifier` agent to add inline citations and verify every source URL in the draft.
5. **Verify** — Spawn the `reviewer` agent to check the cited draft for unsupported claims, logical gaps, zombie sections, and single-source critical findings. Fix FATAL issues before delivering. Note MAJOR issues in Open Questions. If FATAL issues were found, run one more verification pass after the fixes.
6. **Deliver** — Save the final literature review to `outputs/<slug>.md`. Write a provenance record alongside it as `outputs/<slug>.provenance.md` listing: date, sources consulted vs. accepted vs. rejected, verification status, and intermediate research files used. Before you stop, verify on disk that both files exist; do not stop at an intermediate cited draft alone.

## 語言設定（繁體中文 / zh-TW）

使用者為繁體中文使用者。請以**繁體中文（zh-TW）**回答所有使用者可見的文字，包含敘述、摘要、分析、結論、表格標題與引言。

- 程式碼、檔名、CLI 指令、API 名稱、路徑與 URL 保持原文，不翻譯。
- 引用段落保留原文，可在需要時附上繁中譯文。
- 專有名詞與論文／工具名稱維持英文原稱，必要時以括號附上繁中解釋。
- 本節僅規範輸出語言，不覆寫或修改此檔其他原始設定。
