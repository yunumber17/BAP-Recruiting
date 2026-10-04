#!/usr/bin/env python3
import re, json, csv, datetime, collections, pathlib

RAW = pathlib.Path("camps_raw.txt")
OUT = pathlib.Path(".")

MONTHS = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,
          'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}

def slug(s):
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s

rows = []
unparsed = []
for line in RAW.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line or " | " not in line:
        continue  # date-header line
    parts = [p.strip() for p in line.split(" | ")]
    if len(parts) != 4:
        unparsed.append(line); continue
    name, date_str, div, loc = parts
    # date: "Sun, Sep 20, 2026"
    m = re.match(r"^[A-Za-z]{3},\s*([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$", date_str)
    if not m:
        unparsed.append(line); continue
    mon, day, yr = MONTHS[m.group(1)], int(m.group(2)), int(m.group(3))
    iso = datetime.date(yr, mon, day).isoformat()
    # location: "City, ST · Conference"
    if " · " in loc:
        citystate, conf = loc.split(" · ", 1)
    else:
        citystate, conf = loc, ""
    citystate = citystate.strip()
    if ", " in citystate:
        city, state = citystate.rsplit(", ", 1)
    else:
        city, state = citystate, ""
    rows.append({
        "id": f"camp_{slug(name)}_{iso}",
        "name": name,
        "city": city.strip(),
        "state": state.strip(),
        "camp_date": iso,
        "divisions": div.strip(),
        "conference": conf.strip(),
        "schools": name,          # host school = itself -> drives BAP fit + 保存フラグ
        "cost": None,
        "coaches_count": None,
    })

# Dedupe exact (name, date) duplicates, keep first
seen, deduped, dups = set(), [], 0
for r in rows:
    key = (r["name"], r["camp_date"])
    if key in seen:
        dups += 1; continue
    seen.add(key); deduped.append(r)

deduped.sort(key=lambda r: (r["camp_date"], r["name"]))

# ---- write JSON ----
(OUT/"camps.json").write_text(json.dumps(deduped, ensure_ascii=False, indent=2), encoding="utf-8")

# ---- write CSV ----
cols = ["id","name","city","state","camp_date","divisions","conference","schools","cost","coaches_count"]
with (OUT/"camps.csv").open("w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    for r in deduped:
        w.writerow(r)

# ---- write SQL (core columns that already exist on the camps table) ----
def q(v):
    if v is None: return "NULL"
    return "'" + str(v).replace("'", "''") + "'"
sqlcols = ["id","name","city","state","camp_date","divisions","schools"]
with (OUT/"camps.sql").open("w", encoding="utf-8") as f:
    f.write("-- BAP camps import. Review before running in Supabase SQL Editor.\n")
    f.write("-- To replace the current list first, uncomment the next line:\n")
    f.write("-- delete from public.camps;\n\n")
    f.write(f"insert into public.camps ({', '.join(sqlcols)}) values\n")
    vals = []
    for r in deduped:
        vals.append("  (" + ", ".join(q(r[c]) for c in sqlcols) + ")")
    f.write(",\n".join(vals))
    f.write("\non conflict (id) do update set\n")
    f.write("  name=excluded.name, city=excluded.city, state=excluded.state,\n")
    f.write("  camp_date=excluded.camp_date, divisions=excluded.divisions, schools=excluded.schools;\n")

# ---- stats ----
by_div = collections.Counter(r["divisions"] for r in deduped)
by_month = collections.Counter(r["camp_date"][:7] for r in deduped)
print(f"parsed rows (raw):    {len(rows)}")
print(f"duplicates removed:   {dups}")
print(f"final unique camps:   {len(deduped)}")
print(f"unique host schools:  {len(set(r['name'] for r in deduped))}")
print(f"by division:          {dict(sorted(by_div.items()))}")
print(f"date range:           {deduped[0]['camp_date']} -> {deduped[-1]['camp_date']}")
print("by month:")
for k,v in sorted(by_month.items()):
    print(f"  {k}: {v}")
if unparsed:
    print(f"\nUNPARSED LINES ({len(unparsed)}):")
    for u in unparsed: print("  ", u)
else:
    print("\nunparsed lines: 0")
