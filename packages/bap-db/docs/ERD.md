# ER Diagram

Rendered from the Prisma schema. Crow's-foot: `||` one, `o{` many, `o|` optional-one.

```mermaid
erDiagram
  User ||--o| Player : has
  User ||--o| Parent : has
  User ||--o| Coach : "may be"
  User ||--o{ Notification : receives
  User ||--o{ AnalyticsEvent : triggers
  User ||--o{ ActivityLog : "acts in"

  Player ||--o{ PlayerGuardian : "guarded by"
  Parent ||--o{ PlayerGuardian : "guardian of"

  Player ||--o{ TeamMembership : joins
  Team   ||--o{ TeamMembership : includes
  Team   ||--o{ Coach : "coached by"
  School ||--o{ Coach : employs

  Player ||--o{ PlayerMetric : records
  Player ||--o{ Video : uploads
  Player ||--o{ Evaluation : receives
  Coach  ||--o{ Evaluation : writes

  Player ||--o| RecruitingPreference : sets
  Player ||--o{ RecruitingScore : scored
  School ||--o{ RecruitingScore : "scored for"

  Player ||--o{ SavedSchool : saves
  School ||--o{ SavedSchool : "saved by"

  Player ||--o{ CoachContact : contacts
  Coach  ||--o{ CoachContact : "contacted via"
  School ||--o{ CoachContact : "at"
  CoachContact ||--o{ Message : thread
  CoachContact ||--o{ Note : annotated

  Player ||--o{ Scholarship : offered
  School ||--o{ Scholarship : "from"
  Player ||--o{ Commitment : makes
  School ||--o{ Commitment : "to"
  Player ||--o{ Application : submits
  School ||--o{ Application : receives

  Player ||--o{ PlayerShowcase : attends
  ShowcaseEvent ||--o{ PlayerShowcase : "attended by"

  Player ||--o{ Task : owns
  Player ||--o{ Document : holds
  Player ||--o{ Note : writes
  Player ||--o{ AnalyticsEvent : "subject of"

  School ||--o{ SchoolSnapshot : "captured as"
  School ||--o{ Note : "about"
```

## Grouping

- **Identity**: User, Player, Parent, PlayerGuardian, Coach
- **Organizations**: School, SchoolSnapshot, Team, TeamMembership
- **Player data**: PlayerMetric, Video, Evaluation
- **Recruiting**: RecruitingScore, RecruitingPreference, SavedSchool, CoachContact,
  Message, Scholarship, Commitment, Application
- **Events**: ShowcaseEvent, PlayerShowcase
- **Ops**: Task, Notification, Document, Note, AnalyticsEvent, ActivityLog
