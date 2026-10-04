# BAP Recruiting — Curated Asset Pipeline

The goal is the best recruiting database in the country: a *curated* library, not a
scraped one. Automation gives speed; a human review step gives the consistency and
polish that make the app feel professionally designed. Nothing enters the permanent
library without human approval.

## The four passes

**Pass 1 — Gather metadata (automated, low-risk).**
Collect structured, mostly-factual info per target school: official athletics site,
baseball program page, conference, division, nickname, and colors where officially
published. Output: rows in `top250_schools_template.csv`. This pass is safe to
automate because it's text/facts, but still verify against official sources.

**Pass 2 — Gather candidate assets (automated collection, no import).**
For each school, collect *candidates* only — official athletics logo, a campus image,
a home-field image, the coach directory page. Download/reference them into a review
folder. Do **not** import anything into the app yet.

**Pass 3 — Curate (human).**
For each school pick exactly one logo, one campus photo, one field photo. Require:
high quality, consistent aspect ratio, official or appropriately licensed, cropped
consistently. This is the step that separates "a pile of images" from a design system.
Record the approved URLs back into the CSV.

**Pass 4 — Build the library (automated, deterministic).**
Run the generator on the curated CSV:

```
python3 build_media_library.py top250_schools_template.csv media-library.generated.js
```

It validates every row (hex colors, http(s) URLs, required name), warns on Tier-1
gaps, and emits a `window.BAP_MEDIA` file. Review it, then rename to `media-library.js`
to ship. Re-run any time the CSV changes — the file is generated, not hand-edited.

## Asset standards (enforce during Pass 3)

| Asset | Format | Size | Crop rule |
|---|---|---|---|
| School logo | Transparent PNG or SVG, white-safe | 512×512+ | square, centered |
| Campus image | JPG | 1600×900 | same crop style for every school |
| Field image | JPG | 1600×900 | home field only |
| Coach headshot | JPG | 512×512 | square, face centered |

These match how the app renders them: logos as rounded squares on white, campus as a
low-opacity 16:9 banner behind the School Hub header, coach headshots as circles.

## Priority (fill in this order)

- **Tier 1 (must have):** school logo, primary + secondary color, coach headshot.
- **Tier 2:** campus image, field image.
- **Tier 3:** facilities, locker room, team photos — most users won't miss these.

A library with 250 beautifully curated schools beats 10,000 empty rows.

## Licensing — read before shipping publicly

School logos and photos are frequently copyrighted. Public visibility on an athletics
site does **not** grant redistribution rights. For an internal prototype, collecting
assets for review is generally lower-risk; for a public commercial product:

- Prefer official media / brand-resource downloads where their terms permit use.
- Review each asset's usage rights before it enters the shipped library.
- Be ready to replace assets with your own licensed or authorized versions over time.

When in doubt, leave the field blank — the app falls back to the deterministic colored
monogram, which is always safe and always consistent.

## What is intentionally NOT automated

No blind scraping. Sites change, images disappear, crops and quality vary, links rot,
and licensing gets messy. The pipeline automates the boring, deterministic ends
(metadata worklist in, validated library out) and keeps a human in the middle where
judgment actually matters.
