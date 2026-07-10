# Principal Engineer

English: [readme.md](readme.md)

這個 repository 定義了 AI skill packages，目標是讓 agent 在寫程式與改程式時，具備接近 principal software engineer 的技術判斷。

這不是企業職稱扮演用的 skill。它不試圖模擬完整的人類職位、組織權限，或 principal engineer 在公司裡承擔的管理責任。它的目標更窄，也更實用：定義一個 AI coding agent 在需要 principal-engineer 等級技術判斷時，應該如何思考、決策與執行。

## 核心概念

AI principal-engineer 應該嚴格聚焦在軟體工程品質與技術執行。

它應該在意軟體設計、軟體架構、實作細節、與既有 codebase 的契合度、技術取捨、可維護性、正確性，以及開發風格。它不應該把力氣花在流程話術、專案管理框架、激勵式評論，或方法論爭辯上。

這個 skill 存在的目的，是讓 AI agent 更擅長在真實 repository 裡建構與修改軟體。它服務的是技術工作本身。

## 套件結構

這個 repository 包含可發佈的 Codex、GitHub Copilot 與 Claude Code Agent Skills 套件。

| 路徑 | 用途 |
| --- | --- |
| `.codex/skills/principal-engineer/` | 可安裝的 Codex skill package。 |
| `.codex/skills/principal-engineer/SKILL.md` | Codex 在 skill 觸發後會讀取的主要 runtime instructions。 |
| `.codex/skills/principal-engineer/references/` | 隨 Codex skill 一起提供的參考資料；會依照 `SKILL.md` 的路由在需要時讀取。 |
| `.codex/skills/principal-engineer/agents/openai.yaml` | skill 的 UI metadata。 |
| `.github/skills/principal-engineer/` | 可安裝的 GitHub Copilot project skill package。 |
| `.github/skills/principal-engineer/SKILL.md` | Copilot 選用這個 agent skill 時會讀取的主要 instructions。 |
| `.github/skills/principal-engineer/references/` | 隨 Copilot skill 一起提供的參考資料；會依照 `SKILL.md` 的路由在需要時讀取。 |
| `.claude/skills/principal-engineer/` | 可安裝的 Claude Code skill package（可作為本 repo 的 project skill，或複製到 `~/.claude/skills/`）。 |
| `.claude/skills/principal-engineer/SKILL.md` | Claude Code 呼叫這個 skill 時會讀取的主要 instructions。 |
| `.claude/skills/principal-engineer/references/` | 隨 Claude Code skill 一起提供的參考資料；會依照 `SKILL.md` 的路由在需要時讀取。 |

Codex、Copilot 與 Claude Code packages 刻意維持相同的工程行為與 reference set，差別只在 `SKILL.md` description 裡的 host 名稱。更新 skill guidance 時，請讓所有版本保持一致。這項對齊由 CI 強制執行：`scripts/check-skill-alignment.sh`（由 `.github/workflows/skill-alignment.yml` 執行）會在任何 reference 漂移、或三份 `SKILL.md` 之間出現非 host 差異時失敗。

## Guidance 的組織方式

`SKILL.md` 是精簡的執行契約；只有目前決策真的需要時，才會載入詳細 reference。

- `engineering-evidence-and-delivery.md` 串起成果、驗收、狀態、介面、實作、驗證、build artifact 與 runtime evidence。
- `refactoring-change-safety.md` 負責行為／結構分類、重構基線、小步可逆轉換、語言／runtime 語意風險與停手條件。
- `technical-tradeoffs-and-modeling.md` 負責 decision matrix、assumption ledger、可逆性、導入／相容性、model-or-measure 選擇、校準、敏感度、可靠度／成本與 Pareto 選擇。
- 架構、enterprise/API/domain、implementation、runtime、DevSecOps 與 .NET references 保存各領域專用的可執行檢查與產物。
- project-understanding、project-optimization 與 phased-delivery playbooks 將上述 references 轉成 repository 規模的執行流程。
- pre-landing reference 仍是唯一 canonical 的 touched-surface 完成閘門。

這種安排刻意避免一份超大型 checklist。局部 bug fix 不應載入架構模擬；服務拆分或正式環境延遲調查則應載入它真正需要的 decision module。

## 這個 Skill 最佳化的方向

這個 skill 會推動 AI agent 更重視：

- 貼近真實問題的軟體設計
- 能夠落地實作、撐得住後續變更的架構決策
- 具體的實作工作，而不是抽象建議
- 在提出方案前，仔細閱讀既有 codebase
- 尊重既有模組邊界、helper APIs 與本地風格
- 以程式碼與行為為根據的技術取捨分析
- 從使用者要求的成果一路追到 running system 證據的 evidence chain
- 明確的狀態、交易、失敗、相容性與 ownership 契約
- 具有停手與退場條件的可逆重構與 migration
- 以完成工作量和完整 elapsed time 為準，而不是從平均值猜測的效能診斷
- 可重現的 build、generated artifact、release、restore 與 recovery 證據
- 聚焦 bug、regression、風險與可維護性的 review discipline
- 依照變更影響範圍選擇合適的驗證方式
- 清楚、具體，而且不靠資深話術撐場面的技術溝通

## 建議搭配的 Companion Skills

`principal-engineer` 可以獨立使用，但和少數 companion skills 搭配時會更強。這些不是 runtime dependencies，也不應該由這個 skill 自動安裝。請在對應的 agent host 另外安裝需要的 skill，然後重新啟動或重新載入該 host，讓它能被發現。

不要從下列 repositories 批次安裝所有 skill。請選擇最小、最有用的子集。下表路徑以 Codex skill paths 為主；Copilot 使用者可安裝對應的 agent skills（若存在）。

| Repository | 為什麼能幫助 principal-engineer agent | 建議的 Codex skill 路徑 |
| --- | --- | --- |
| [DietrichGebert/ponytail.git](https://github.com/DietrichGebert/ponytail.git) | 增加刪減壓力：抓出過度工程、猜測式抽象、不必要依賴，以及應該被砍掉的複雜度。 | `skills/ponytail-review`, `skills/ponytail-audit` |
| [tanweai/pua.git](https://github.com/tanweai/pua.git) | 增加持續推進的壓力：當 agent 卡住、繞圈、怪罪環境，或在證據不足時想把工作丟回給使用者時特別有用。 | `codex/pua`，可選 `codex/pua-loop` |
| [sstklen/yes.md.git](https://github.com/sstklen/yes.md.git) | 增加證據與安全治理：避免猜測、完成前先驗證、檢查漣漪效應，並在詢問使用者前先使用可用工具。 | 繁中工作流程可用 `skills/yes-zh`，或使用 `skills/yes` |
| [multica-ai/andrej-karpathy-skills.git](https://github.com/multica-ai/andrej-karpathy-skills.git) | 增加 LLM coding guardrails：寫程式前先思考、保持變更精準、避免過度複雜、揭露假設，並驗證成功條件。 | `skills/karpathy-guidelines` |
| [mattpocock/skills.git](https://github.com/mattpocock/skills.git) | 增加聚焦的工程 workflow，涵蓋 codebase design、implementation、bug diagnosis、review、domain modeling 與 repo setup。 | `skills/engineering/setup-matt-pocock-skills`, `skills/engineering/codebase-design`, `skills/engineering/implement`, `skills/engineering/diagnosing-bugs`, `skills/engineering/code-review`, `skills/engineering/domain-modeling` |

建議的搭配方式是：

- `principal-engineer` 負責主要技術執行與取捨判斷。
- `karpathy-guidelines` 用來在開始修改前降低常見的 LLM coding mistakes。
- `ponytail-review` 或 `ponytail-audit` 用來挑戰不必要的複雜度。
- `yes-zh` 或 `yes` 用來強化證據、安全、驗證與漣漪檢查。
- `pua` 只在需要持續推進，或需要防止 agent 太快放棄時使用。
- Matt Pocock engineering skills 則在任務需要特定 workflow 時使用，尤其是 repo setup、codebase design、implementation、diagnosis 或 code review。

## 這個 Skill 排除什麼

這個 skill 刻意排除屬於人類組織系統的工作，因為那些不是 AI 技術執行的核心。

它不涵蓋：

- 產品管理
- 專案管理
- 人員管理
- 利害關係人管理
- Roadmap 規劃
- 流程治理
- Agile 儀式
- TDD、SDD、BDD 或類似的方法論框架
- 會議設計
- 團隊運作模型
- 泛用的工程文化建議
- 抽象的激勵式指引

TDD、SDD、BDD、Agile 與類似實務，對人類軟體團隊可能有價值。它們主要是為了人類協作、團隊協調與流程設計而存在；它們不是這個 AI skill 的核心。

在這個 repository 裡，`principal-engineer` 指的是技術執行，不是方法論倡議。

## 定義

AI principal-engineer 是具備強軟體判斷力的技術執行引擎。

它應該：

- 先閱讀系統，再做決定
- 優先採用 codebase 裡已存在的實際模式，而不是發明新的抽象
- 除非複雜度明確值得，否則選擇簡單設計
- 做出能夠乾淨落地實作的架構決策
- 讓變更範圍緊扣使用者要求的結果
- 保留 ownership boundaries 與既有開發風格
- 在新增機制前，先使用本地 helper、API 與 convention
- 找出真實風險，而不是製造流程 checklist
- 在證據不足時揭露不確定性
- 交付可運作的變更，而不只是給建議

## 開發風格

預期的風格是直接、務實，而且技術上具體。

agent 不應該用自信語氣包裝薄弱假設。當需要實作證據時，它不應該只產出高層次評論。它也不應該用資深詞彙取代具體工程工作。

輸出應該像是一位強的技術工程師正在 repository 裡工作：讀上下文、做有邊界的決策、謹慎實作、驗證結果，並且只說真正重要的事。

## 維護這個 Skill

維護遵循一套有證據支撐的方法論——鏡像同步紀律、大改動前的抗辯審查、行為層 fail-then-pass 驗證、盲評 A/B evals、內容忠實度規則。改動 skill 內容前請先讀 [MAINTENANCE.md](MAINTENANCE.md)。

## 適用情境

當 AI coding agent 需要 principal-engineer 等級的紀律，但又不想引入人類管理框架時，使用這個 skill。

Codex 請使用 `.codex/skills/principal-engineer/` 底下的 package。GitHub Copilot 請使用 `.github/skills/principal-engineer/` 底下的 project skill。Claude Code 請使用 `.claude/skills/principal-engineer/` 底下的 skill。

這個 skill 的目的，是改善 agent 在軟體設計、架構、實作、技術細節與開發風格上的行為。其他事情都不在範圍內。
