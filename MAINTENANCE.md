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
4. 只有使用者明確要求或授權 push 時才推送，之後確認 CI（skill-alignment workflow）綠；
   未授權時停在本機驗證完成，不把「改 skill」解讀成允許遠端 mutation。

## 2. 重大改動先抗辯再合入

大型設計或新增內容：草稿完成後，平行派出三個獨立反方視角審查——**skeptic**（正確性：
內部矛盾、邏輯漏洞、可判定性）、**red-team**（安全與失效：照做會出什麼事故、gate 邊界、
偽權威風險）、**simplifier**（過度工程：重複、膨脹、未被要求的彈性）。維護者自己裁決：
逐條採納/駁回並寫明理由。校準預期：三方全部否定初稿是正常且有價值的結果（本 repo 的
DevSecOps 擴充初稿即被抓出 pipeline gate 漏洞、baseline 無治理、OIDC wildcard 提權等
19 條真問題）。修完由 fresh-context 審查者逐條驗收落地後才推送。

## 3. 行為驗證（fail-then-pass）

改了 skill 的規則 → 必須用改動前後各跑同一評測場景，證明目標行為翻轉。
歷史實例：當時 `playbook-phased-delivery.md` 的 Phase 0 gate-lens 規則，用 S8 場景驗證
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
  與 parser/native/resource 通用機制：`engineering-evidence-and-delivery.md`；P2 擁有執行流程。
- 重構 transformation、語言語意與差分驗證機制：`refactoring-change-safety.md`；B/S/M、behavior card、
  小步執行與 stop gate 由 P3 擁有。
- decision comparison matrix、assumption ledger、可逆性、dependency/framework、distributed delivery/idempotency、
  versioned migration/compatibility、model-or-measure、分析方法選型、calibration/sensitivity/reliability/
  cost/Pareto：`technical-tradeoffs-and-modeling.md`；決策、實驗與 slice 由 P5 擁有。
- quality scenario、S×D×V coupling、decomposition、workflow/data ownership、fitness/PoC：
  `architecture-system-design.md`。
- persistence/concurrency/session、API traffic/lifecycle、DDD/outbox/process/CQRS/ES/DI：
  `enterprise-api-domain-model.md`。
- construction/cognitive load/state-effects/errors/tests/AI change：`implementation-code-quality.md`。
- operational map、完整 elapsed-time accounting、trace experiment、capacity/recovery：
  `runtime-ops-diagnostics.md`。
- touched-surface gate matrix 只放 `pre-landing-review-prevention.md`；terminal procedure 與
  READY/NOT READY/BLOCKED 只由 P6 擁有。specialist reference 不可再放另一套 audit/exit workflow。

新增規則前先確認 canonical 家；相同判準不要在多檔各寫一份略有差異的版本。

### 2026-07-10 note_fable 整合補記

- `../PRE-principal-engineer/data/note_fable/`（同 26 本書的 Fable 5 繁中蒸餾版，4,018 招式＋
  2,379 稽核 checkbox）為第二個維護期語料，與 note-5.6 同規則：只作來源，不進 runtime package，
  不逐本增生 reference，不搬書名/章節。
- **掃描判準（repository-wide scan predicates）的 canonical 家＝`audit-scan-checklists.md`**；
  該檔由 P1 step 2/step 6、P2 New repository 分支與 pre-landing 的 gap-scan 指標行引用，
  只供判準、無 workflow、無完成權。新增掃描判準一律進該檔；既有 topic reference 中重疊的
  判準維持現狀（歷史存量），要遷移必須附 removal map。
- 該檔極性約定：YES=healthy；audit 語境所有 check action 取唯讀形態，非唯讀動作標
  authorization-gated。改動該檔時不得破壞這兩個約定。

## 7. Action-first execution ownership

知識覆蓋不等於可執行 Skill。`note-5.6` 原本反覆出現的 Agent execution contract
必須由 playbook 保存；topic reference 只提供當步判準，不可擁有頂層流程或獨立宣告完成。

固定路由：

- P1 audit/fix：`playbook-project-optimization.md`
- P2 feature/bug/vertical slice：`playbook-vertical-slice-delivery.md`
- P3 refactor/legacy：`playbook-safe-existing-code-change.md`
- P4 runtime diagnosis/remediation：`playbook-runtime-diagnosis.md`
- P5 decision/migration：`playbook-technical-decision.md`
- P6 terminal proof：`playbook-landing-proof.md`

所有 primary 實作流程必須以 P6 結束；subordinate 只回傳 `PROVED`/`CHANGED`/`BLOCKED` 給 caller。
有效完成至少要有 code/test/script/requested artifact、
actual command result、final diff inspection 與 explicit stop condition。只有使用者明示 read-only，
或具體 decision/access/environment 不可取得時，才能 prose-only 結案。不要為了證明 skill 有跑而
污染 repo 寫長篇文件；work packet 預設留在 working memory，正式 artifact 只在任務自然需要時建立。

## 8. 2026-07-10 action-first removal map

這次不是把 playbook 疊在百科 reference 上，而是刪掉重複 workflow。被移除的內容都有唯一接手者：

| Removed duplicate workflow | Canonical owner after removal |
| --- | --- |
| `refactoring-change-safety.md` classification/card/loop/action/stop | SKILL B/S/M scope + P3 + P6 |
| `implementation-code-quality.md` start/change/legacy disciplines | P2 or P3 |
| `technical-tradeoffs-and-modeling.md` fixed procedure/output/audit | P5 |
| `runtime-ops-diagnostics.md` runtime audit/artifact exit | P4 |
| `architecture-system-design.md` architecture audit/artifact exit | P5 |
| `enterprise-api-domain-model.md` audit/readiness procedure | current P2/P5 caller |
| `engineering-evidence-and-delivery.md` repo routing/action/readiness | P1/P2/P6 |
| `pre-landing-review-prevention.md` topic procedures/output template | P2-P5 mechanics + P6 terminal proof |
| Unrouted worked examples/review-governance template | `docs/reference-archive/` (maintenance only) |

刪除後 canonical `.claude` package（SKILL + references）為 2,811 行，比 `5a92ee1` 的
3,311 行少 500 行（15.1%），同時新增了五個 P2-P6 executable playbooks。後續若又把 start gate、audit loop、
output template 或 completion gate 寫回 specialist reference，視為 workflow duplication regression。

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
- 把來源的 Agent 執行契約拆成 topic bullets，會得到「知識完整但只會寫報告」的百科型 skill。
  評測必須看 disposable fixture 的 filesystem diff、command exits、hidden behavior 與 stop scope，
  不能只評回答內容。

## 證據索引

- 全部評測數據與 caveats：`evals/README.md`（場景 S1–S11）、`evals/results-2026-07-09.md`、
  `evals/results-2026-07-10.md`、`evals/results-2026-07-10-note-5.6.md`、
  `evals/results-2026-07-10-action-first.md`
- 2026-07-10 演進鏈：`d03703c` 去重 → `77d7ce4` 忠實度修補 → `4d547f6` 能力擴充 →
  `4ffdee6` break-glass → `a378ef4` S7 N=5 → `ebfc17e`/`b614749` S8 → `6b12125` S9＋gate-lens
