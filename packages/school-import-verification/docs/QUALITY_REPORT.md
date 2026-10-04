# QUALITY_REPORT

**Generated:** 2026-07-02T02:38:51.533Z
**Overall field completion (mean across all fields):** 84.1%

## Validation summary

- **Errors:** 0
- **Warnings:** 148
- **Info:** 4
- **Blocking (error) issues:** NONE ✅

### Issue breakdown

| Code | Severity | Count |
|---|---|---|
| ROSTER_RANGE | warning | 134 |
| BAD_PHONE | warning | 10 |
| GRAD_ZERO | info | 4 |
| ENROLLMENT_RANGE | warning | 3 |
| BAD_URL | warning | 1 |

## Missing-field heatmap (□ = missing decile)

```
coachNote                □□□□□□□□□□ 0.2%
campLink                 ■□□□□□□□□□ 7.2%
recruitingCoordinator    ■□□□□□□□□□ 13.3%
email                    ■■■□□□□□□□ 25.8%
applicationFee           ■■■■□□□□□□ 39.9%
assistantCoaches         ■■■■■□□□□□ 53.6%
roomAndBoard             ■■■■■■■□□□ 69.1%
headCoach                ■■■■■■■■□□ 77.7%
retentionRate            ■■■■■■■■■■ 96.3%
totalRevenue             ■■■■■■■■■■ 98.9%
operatingExpenses        ■■■■■■■■■■ 98.9%
rosterSize               ■■■■■■■■■■ 98.9%
phone                    ■■■■■■■■■■ 98.9%
medianEarnings6yr        ■■■■■■■■■■ 99.4%
medianEarnings10yr       ■■■■■■■■■■ 99.5%
acceptanceRate           ■■■■■■■■■■ 99.6%
address                  ■■■■■■■■■■ 99.6%
tuitionInState           ■■■■■■■■■■ 99.8%
tuitionOutState          ■■■■■■■■■■ 99.8%
netCost                  ■■■■■■■■■■ 99.8%
graduationRate           ■■■■■■■■■■ 99.9%
extId                    ■■■■■■■■■■ 100%
name                     ■■■■■■■■■■ 100%
city                     ■■■■■■■■■■ 100%
state                    ■■■■■■■■■■ 100%
control                  ■■■■■■■■■■ 100%
division                 ■■■■■■■■■■ 100%
conference               ■■■■■■■■■■ 100%
campusSetting            ■■■■■■■■■■ 100%
enrollment               ■■■■■■■■■■ 100%
athleticWebsite          ■■■■■■■■■■ 100%
schoolWebsite            ■■■■■■■■■■ 100%
sourceUrl                ■■■■■■■■■■ 100%
```

## Coverage of production-critical identity fields

- **name:** 100%
- **city:** 100%
- **state:** 100%
- **control:** 100%
- **division:** 100%
- **conference:** 100%

## Suspicious values (reported, never auto-corrected)

### Roster size out of [15,60]
| Row | extId | Value | Message |
|---|---|---|---|
| 6 | adrian-college__michigan | 71 | Value 71 outside expected [15, 60] |
| 21 | alma-college__michigan | 65 | Value 65 outside expected [15, 60] |
| 52 | assumption-university__massachusetts | 61 | Value 61 outside expected [15, 60] |
| 53 | atlantic-cape-community-college__new-jersey | 10 | Value 10 outside expected [15, 60] |
| 61 | austin-college__texas | 61 | Value 61 outside expected [15, 60] |
| 65 | avila-university__missouri | 65 | Value 65 outside expected [15, 60] |
| 68 | baker-university__kansas | 62 | Value 62 outside expected [15, 60] |
| 70 | baldwin-wallace-university__ohio | 63 | Value 63 outside expected [15, 60] |

### Enrollment out of expected range
| Row | extId | Value | Message |
|---|---|---|---|
| 511 | grand-canyon-university__arizona | 170467 | Value 170467 outside expected [50, 120000] |
| 691 | liberty-university__virginia | 143337 | Value 143337 outside expected [50, 120000] |
| 1179 | southern-new-hampshire-university__new-hampshire | 255134 | Value 255134 outside expected [50, 120000] |

### Malformed phone numbers
| Row | extId | Value | Message |
|---|---|---|---|
| 6 | adrian-college__michigan | (517) 265-5161 ext. 4006 | Phone has 14 digits (expected 10-11) |
| 50 | asbury-university__kentucky | 859-858-3511 x2452 | Phone has 14 digits (expected 10-11) |
| 424 | fairfield-university__connecticut | 203-254-4000 ext. 2605 | Phone has 14 digits (expected 10-11) |
| 445 | florida-national-university-main-campus__florida | (305) 821-3333 Ext 1153 | Phone has 14 digits (expected 10-11) |
| 508 | grace-college-and-theological-seminary__indiana | 574-372-5100 x6264 | Phone has 14 digits (expected 10-11) |
| 666 | lancaster-bible-college__pennsylvania | 717.560.8200 x5463 | Phone has 14 digits (expected 10-11) |
| 749 | martin-luther-college__minnesota | 507.354.8221 ext. 200 | Phone has 13 digits (expected 10-11) |
| 850 | mount-vernon-nazarene-university__ohio | 740-392-6868 x 3102 | Phone has 14 digits (expected 10-11) |

### Malformed emails
_none_

### Acceptance rate = 0
_none_

## Fields safe for production

Fields at ≥95% coverage with zero blocking issues are safe to power features now:

- extId (100%)
- name (100%)
- city (100%)
- state (100%)
- control (100%)
- division (100%)
- conference (100%)
- campusSetting (100%)
- enrollment (100%)
- acceptanceRate (99.6%)
- retentionRate (96.3%)
- graduationRate (99.9%)
- medianEarnings6yr (99.4%)
- medianEarnings10yr (99.5%)
- tuitionInState (99.8%)
- tuitionOutState (99.8%)
- netCost (99.8%)
- totalRevenue (98.9%)
- operatingExpenses (98.9%)
- rosterSize (98.9%)
- athleticWebsite (100%)
- schoolWebsite (100%)
- address (99.6%)
- phone (98.9%)
- sourceUrl (100%)

## Fields NOT yet production-grade (use with fallbacks)

- coachNote (0.2%)
- campLink (7.2%)
- recruitingCoordinator (13.3%)
- email (25.8%)
- applicationFee (39.9%)
- assistantCoaches (53.6%)
- roomAndBoard (69.1%)
- headCoach (77.7%)

## Recommended manual fixes

1. Review roster-size and enrollment outliers flagged above; confirm scraped values against source pages.
2. Backfill **Email** (currently low coverage) for coach-contact features that require direct email.
3. Backfill **Recruiting Coordinator** and **Camp Link** where available.
4. Re-verify the small number of malformed phone rows.

## Known limitations

- Enrichment fields such as Email, Recruiting Coordinator, Camp Link and Coach Note are sparse; treat as optional.
- Financials (Total Revenue, Operating Expenses) originate from public filings and can lag by a year.
