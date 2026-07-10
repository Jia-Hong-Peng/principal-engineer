# 維護方法論（Maintenance Methodology）

> 2026-07-10 在一次全面優化 session 中建立並實戰驗證的維護流程，供任何後續維護者
> （人類或 AI agent，特別是較小模型）沿用。所有流程都在本 repo 的 commit 歷史與
> `evals/results-2026-07-10.md` 中留有實際證據。

## 1. 發佈紀律（每次改 skill 內容必走）

1. 只在 `.claude/skills/principal-engineer/` 鏡像動手。
2. 同步另外兩個鏡像：references 原樣複製；SKILL.md 只允許 description 行的宿主名不同：
   ```bash
   for v in codex github; do cp .claude/skills/principal-engineer/references/*.md .$v/skills/principal-engineer/references/; done
   sed -E '/^description:/ s/Claude Code/Codex/g'   .claude/skills/principal-engineer/SKILL.md > .codex/skills/principal-engineer/SKILL.md
   sed -E '/^description:/ s/Claude Code/Copilot/g' .claude/skills/principal-engineer/SKILL.md > .github/skills/principal-engineer/SKILL.md
   ```
3. `bash scripts/check-skill-alignment.sh` 必須輸出 `OK`。同步前跑一次取 FAIL、同步後取
   PASS——這是文件類改動的 fail-then-pass 證據。
4. Push 後確認 CI（skill-alignment workflow）綠。

## 2. 重大改動先抗辯再合入

大型設計或新增內容：草稿完成後，平行派出三個獨立反方視角審查——**skeptic**（正確性：
內部矛盾、邏輯漏洞、可判定性）、**red-team**（安全與失效：照做會出什麼事故、gate 邊界、
偽權威風險）、**simplifier**（過度工程：重複、膨脹、未被要求的彈性）。維護者自己裁決：
逐條採納/駁回並寫明理由。校準預期：三方全部否定初稿是正常且有價值的結果（本 repo 的
DevSecOps 擴充初稿即被抓出 pipeline gate 漏洞、baseline 無治理、OIDC wildcard 提權等
19 條真問題）。修完由 fresh-context 審查者逐條驗收落地後才推送。

## 3. 行為驗證（fail-then-pass）

改了 skill 的規則 → 必須用改動前後各跑同一評測場景，證明目標行為翻轉。
實例：`playbook-phased-delivery.md` 的 Phase 0 gate-lens 規則，用 S8 場景驗證
t4 競態偵測從 0.5 → 2.0（見 results 檔 S8v2 節）。文字改了但行為沒測＝未驗證，
只能如實標註「已修改、未驗證」。

## 4. 評測紀律（evals/ 的使用規則）

- Treatment＝受測 agent 真實讀取安裝的 SKILL.md 並自行路由 references，不是貼 skill 文字。
- 受測 agent 不可知道評分標準；輸出用中性檔名；**評分前必跑洩底 grep**
  （skill、SKILL.md、GROUND-TRUTH、arm 名稱等字樣）。
- 裁判是獨立 fresh agent，單份絕對評分，rubric 每級必須可判定
  （例：「generic＝該段無任何 repo 路徑、契約名或量測數字」），並要求引證據。
- Repo-backed 場景：planted facts 必須可 grep 核實；ground truth 檔放在 fixture 目錄
  **外**（`evals/fixtures/s8-orders-monolith-GROUND-TRUTH.md` 的位置就是為此）；
  跑完用 `git status` 驗證 fixture 未被受測 agent 修改；fixture 凍結，要改就開 v2。
- 誠實報告：N 值、裁判變異（實測 control 分數有 ±1-2 的裁判噪音）、跨 rubric 版本
  分數不可比、天花板化的指標要點名。

## 5. 內容忠實度紀律

- 一個判準只有一個 canonical 家；其他檔用一行指標。刪除任何條目前，必須指出等價內容
  的位置（檔案:行號）或證明它是零判準的口號；刪除記錄落檔（removal map）。
- 沒有語料來源的新內容，檔案開頭必須有 source-status 聲明（實務慣例合成、非書源、
  vendor 細節需對照官方文件）——`devsecops-security-governance.md` 開頭是範本。
- 語料查證防同名異義：曾實測 "SAST" 的命中其實是 di**sast**er 的子字串、"N+1" 命中
  是記憶體 prefetching——關鍵詞命中必須讀上下文確認。

## 6. 2026-07-10 note-5.6 整合後的 canonical ownership

`../PRE-principal-engineer/data/note-5.6/` 的 26 份技術筆記只作維護期來源，不進 runtime
package。整合時已按 trigger/mechanism/decision/check/stop condition 去重並改寫為英文；後續不要
按來源檔逐本增生 reference，也不要把書名、作者或章節結構搬回公開 skill。

- outcome → state/interface → implementation → verification → runtime 的 evidence chain、build/generator/artifact
  基線與 parser/native/resource 通用防線：`engineering-evidence-and-delivery.md`。
- B/S/M 分類、behavior card、小步重構、語言語意、差分驗證與 stop gate：
  `refactoring-change-safety.md`。
- decision matrix、assumption ledger、可逆性、dependency/framework、distributed delivery/idempotency、
  versioned migration/compatibility、model-or-measure、分析方法選型、calibration/sensitivity/reliability/
  cost/Pareto：`technical-tradeoffs-and-modeling.md`。
- quality scenario、S×D×V coupling、decomposition、workflow/data ownership、fitness/PoC：
  `architecture-system-design.md`。
- persistence/concurrency/session、API traffic/lifecycle、DDD/outbox/process/CQRS/ES/DI：
  `enterprise-api-domain-model.md`。
- construction/cognitive load/state-effects/errors/tests/AI change：`implementation-code-quality.md`。
- operational map、完整 elapsed-time accounting、trace experiment、capacity/recovery：
  `runtime-ops-diagnostics.md`。
- touched-surface final completion criterion 仍只放 `pre-landing-review-prevention.md`；其他檔可列
  domain-readiness prerequisites，但必須明說它們不能獨立宣告 landing-ready，並導回 canonical gate。

新增規則前先確認 canonical 家；相同判準不要在多檔各寫一份略有差異的版本。

## 已知陷阱（都真實發生過）

- `.gitignore` 未錨定的 `data/` 樣式在大小寫不敏感的檔案系統上會吃掉 `Data/` 目錄——
  fixture 的 `AppDbContext.cs` 曾因此漏推（已修為 `/data/`）。
- 給裁判的檔名含 "control" 會讓盲評失效——曾因此廢掉一輪評審重跑。
- **任務框架決定鏡頭**：設計諮詢題看不見程式缺陷（競態 0/8）、review 題看不見架構
  阻斷（FK 0/8），兩臂皆然。評測設計與 skill 改動都要意識到這個對稱盲區。
- Haiku 級模型在輸出契約下嚴重冗長（一頁的請求寫 500+ 行）且契約遵循會與讀碼搶預算；
  未解，勿假設小模型套上規則就穩定。
- 健檢/稽核類 agent 會系統性高估可刪量、誤報重複——執行刪除時按「有等價物才刪」
  鐵則保守處理，行數目標讓位於內容保全。

## 證據索引

- 全部評測數據與 caveats：`evals/README.md`（場景 S1–S10）、`evals/results-2026-07-09.md`、
  `evals/results-2026-07-10.md`、`evals/results-2026-07-10-note-5.6.md`
- 2026-07-10 演進鏈：`d03703c` 去重 → `77d7ce4` 忠實度修補 → `4d547f6` 能力擴充 →
  `4ffdee6` break-glass → `a378ef4` S7 N=5 → `ebfc17e`/`b614749` S8 → `6b12125` S9＋gate-lens
