# BAP Canonical Vocabulary Spec

Purpose: lock one word per concept so the UI stops leaking multiple mental models for the same thing. This is a naming contract, not a code change. Nothing here is implemented yet; it is the map to implement against.

The one rule: **one concept, one word.** Before adding any user-facing label, find the concept below and use its canonical term. If a concept is not listed, it is new and must be added here first.

## Status: FROZEN CORE (Cluster A + B)

The per-school stage (Cluster A -> リクルーティング段階) and the fit-vs-evaluation split (Cluster B -> フィット / 自分の評価) are **frozen**. They are the app's mental-model backbone; changing them silently breaks interpretation everywhere. Do not edit these terms unless a UX problem forces it, and if you do, update this file and `vocab_guard.sh` in the same change.

Enforcement is automated: `vocab_guard.sh` fails the build if a banned term reappears (see "Enforcement" below). Clusters C and E are **paused** (real but low-risk polish); do them only if they start causing confusion.

## The "%" rule (read fit as a relative indicator, not authority)

A percentage is allowed on a フィット, but the number must always read as a **relative indicator**, never as precise authority. Concretely: a フィット % is フィット度 (a degree of fit against a division benchmark), not a グレード or ランキング. Never show a フィット number without the word フィット attached, never call it スコア/点数, and keep the "目安" (rough guide) framing in captions. This stops users from treating フィット 82% as a hard grade.

---

## Canonical terms

| # | Concept (what it really is) | Canonical JP | English meaning | Backing data | Short form |
|---|---|---|---|---|---|
| 1 | Where the player stands with a school (relationship state) | リクルーティング段階 | recruiting stage | `decision_status` via `schoolStage()` | 段階 |
| 2 | Per-coach outreach state (sent / replied / meeting) | コーチ連絡状況 | contact status | `coach_contacts.status` | 連絡状況 |
| 3 | Document readiness (missing / in progress / done) | 書類の状態 | document state | `recruiting_documents.status` | 状態 |
| 4 | System read of school match (per dimension) | フィット | fit | computeMatch output | 競技フィット / 学業フィット |
| 5 | System read of school match (overall) | 総合フィット | overall fit | `computeMatch().score` | フィット |
| 6 | The player's own 1-5 star rating of a school | 自分の評価 | personal rating | `personal_rating` | 評価（★） |
| 7 | Player-wide chronological story (all schools) | 歩み | journey | derived (`buildTimelineEvents`) | 歩み |
| 8 | One entity's event log (this coach / this school) | 履歴 | history | derived | 履歴 |
| 9 | Forward-looking guidance (what to do next) | ロードマップ | roadmap | derived | ロードマップ |
| 10 | The whole coach relationship object | リレーション | relationship | coach CRM | リレーション |
| 11 | A single logged contact event | やり取り | interaction | `coach_messages` | やり取り |
| 12 | The player's document resume | 履歴書 | resume | derived | 履歴書 |

---

## Replacement map (old wording -> canonical)

Status column: DONE = already unified in code; TODO = still drifting, safe to fix later.

### Cluster A: recruiting stage (concept 1)
- 意思決定 -> リクルーティング段階 / 段階  (DONE)
- リクルート状況 / リクルートステータス -> リクルーティング段階  (DONE)
- 進捗 (School Dashboard funnel header) -> リクルーティング段階  (DONE)
- "funnel" / "pipeline" framing anywhere in UI -> 段階 (never a pipeline/score)  (DONE)

### Cluster B: fit vs evaluation (concept 4/5/6) — highest remaining drift
- 適合 (fit reasons, e.g. "学業面: X% 適合") -> フィット  (TODO)
- 評価 when it means the computeMatch verdict ("BAPの評価", "なぜこの評価なのか") -> フィット / 総合フィット  (TODO)
- 評価 when it means the 1-5 star rating (saved card "評価") -> 自分の評価  (TODO)
- Keep 評価 as a plain verb ("コーチが評価する") — that is fine, it is not a UI label.

### Cluster C: coach relationship vs communication (concept 10/11)
- コミュニケーション / コミュニケーション記録 (health header) -> やり取り / やり取りの記録  (TODO)
- リクルーティング・リレーション (card title) -> keep as リレーション (canonical)  (DONE)
- Interaction default label やり取り -> keep (canonical)  (DONE)

### Cluster D: time views (concept 7/8/9)
- タイムライン (retired static screen) -> removed  (DONE)
- 歩み = player-wide story; 履歴 = one entity's log. Do not swap them.  (RULE)
- ロードマップ = future only; never used for past events.  (RULE)

### Cluster E: the reused word ステータス / 状況 / 状態 (concepts 2/3)
- Bare ステータス for the coach pipeline -> コーチ連絡状況 / 連絡状況  (TODO)
- Bare 状況 / 状態 for documents -> 書類の状態  (TODO)
- Guard/internal `status` field names can stay; this is about ON-SCREEN labels only.
- Do not use the bare word ステータス as a user-facing label; always qualify it (コーチ連絡状況, 書類の状態) or use the concept's canonical term.

---

## Acceptable collisions (leave as-is)

- 履歴書 (resume) shares the kanji 履歴 with 履歴 (history). This is standard Japanese and reads clearly in context; no change.
- 段階 appears in the unrelated phrase "5段階の評価" (a 5-point scale). Fine; the number disambiguates.
- 評価 as a verb ("評価される") is ordinary Japanese and is not a label.

---

## Action layer (three separated concepts — do not blur)

The deterministic action layer has exactly three roles, each with its own word. Keeping them distinct is what stops "next action / blocker / suggestion" from merging into noise.

| Role | Canonical JP | Rule |
|---|---|---|
| Primary CTA | 次のアクション | Exactly ONE per surface. Chosen by the Action Priority Contract (`SCHOOL_ACTION_RULES` in code). Carries a factual `context` tag (e.g. 返信待ち8日) for situational grounding — never a score. |
| Diagnostic | 進行を妨げている要因 | Read-only list of what is holding the school back. NO action buttons here; resolving it is the job of 次のアクション, so the two never compete. |
| Secondary (optional) | 補助アクション | Optional extra actions. Reserved term; add only if a surface truly needs more than the single primary CTA. |

**Action Priority Contract.** Next-action rules are ordered by explicit named tiers (`ACTION_TIERS`): terminal, blocking, time_sensitive, momentum, advancement, steady. First match wins. Any new rule MUST declare a tier so it cannot silently change priority. This is the structural guard against rule-explosion drift. No confidence scores, no AI ranking, no per-coach personalization — a fixed contract only.

## Canonical hierarchy rule (the anti-drift backbone)

Words alone are not enough; they must sit in a fixed three-level hierarchy. A concept's level decides how it may be labeled. This is what stops future features from smuggling scoring language back in.

**Level 1 — System Truth.** Raw, internal, never labeled as a "judgment" in the UI.
- `computeMatch()` output, `decision_status`, raw metrics, `athleticScore` internals.

**Level 2 — System Interpretation.** Safe, abstracted reads of Level 1. May be shown, but never as a "score/点数/スコア".
- フィット (競技/学業/総合), リクルーティング段階, リレーション, fitLevel labels.

**Level 3 — User Expression.** Authored by the player; never feeds back into Level 2.
- 自分の評価 (★), メモ / コメント, 共有した資料.

Hard rules:
1. Level 1 is never labeled as "評価" (evaluation/judgment) in the UI.
2. Level 2 is never shown as a "スコア/点数". A percentage is allowed (e.g. 競技フィット 82%); the word スコア is not.
3. Level 3 never affects Level 2. A player's ★ rating or memo must not change フィット or 段階.

Any new label must declare its level. If it is Level 1 it stays internal; if Level 2 it uses a canonical フィット/段階/リレーション term; if Level 3 it uses 自分の / メモ framing.

---

## Consistency rules (so new features cannot re-introduce drift)

1. **Stage is stage.** Anything about where a player stands with a school uses 段階 and reads `decision_status` via `schoolStage()`. Never 意思決定, ステータス, funnel, pipeline, or a score.
2. **Fit is fit.** Any system read of school match uses フィット (競技フィット / 学業フィット / 総合フィット). Never 適合, never 評価. Reserve 評価 for the player's own ★ rating (自分の評価).
3. **Two time words, one direction each.** 歩み = the player's whole story (all entities, past). 履歴 = one entity's log (past). ロードマップ = forward guidance. Never reuse タイムライン.
4. **Relationship vs event.** リレーション = the coach relationship as a whole. やり取り = one logged event. Drop コミュニケーション as a UI noun.
5. **Never ship a bare ステータス label.** Qualify it (コーチ連絡状況, 書類の状態) or use the concept's canonical word.
6. **Add to this file first.** A new concept must be named here before it appears in the UI. New features consume existing vocabulary; they do not invent synonyms.

---

## Enforcement (Vocabulary Contract Guard)

`vocab_guard.sh` is the regression guard. It is deliberately **two-tier** so it protects the frozen cores without over-constraining future UX work (brittle linting causes developer friction and false blocks).

**HARD BAN (blocking, exit 1).** Specific compound phrases that are always wrong here and have no valid alternate meaning:
適性スコア, 平均適性, BAPの評価, なぜこの評価, このスコアの理由, スコアを改善, 学業適合, 競技評価, 意思決定, リクルートステータス. If any appears, the guard fails.

**SOFT WARN (advisory, never fails).** The ambiguous single words 評価 / スコア / 適合. These are legitimate in some contexts (評価 as a verb, TOEFL/SAT/ACT スコア, a non-match 適合), so the guard lists them for a human glance after filtering out the known-good uses, but it never blocks. This keeps the system stable without freezing valid future wording like "コーチの評価" or a debug "スコアカードUI".

- Run manually: `bash vocab_guard.sh bap.html`
- Wire it into a pre-commit hook or CI step. The exit code reflects HARD only; SOFT is informational.
- Explicitly allowed (never "fixed"): TOEFL/SAT/ACT スコア, 評価 as a verb, 自分の評価 (Level 3 stars), and the legacy field label （旧）リクルートステータス.

If you legitimately need to change a frozen term, edit this spec AND the guard's HARD list together, in the same commit. The guard is the contract; this file is the reason.

## Status of each cluster

- Cluster A (per-school stage -> リクルーティング段階): DONE, FROZEN, guarded.
- Cluster B (fit vs 評価 -> フィット / 自分の評価): DONE, FROZEN, guarded.
- Cluster D (time words): DONE (static タイムライン removed; 歩み / 履歴 / ロードマップ scoped).
- Cluster C (コミュニケーション -> やり取り): PAUSED. Small, contained to the relationship card. Do only if it causes confusion.
- Cluster E (bare ステータス -> qualified): PAUSED. Coach tab + document center labels. Low structural risk.

We are intentionally in enforcement/stabilization mode, not semantic expansion. The frozen cores plus `vocab_guard.sh` are worth more than finishing C/E right now.
