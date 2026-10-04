import pathlib
from playwright.sync_api import sync_playwright

OUT = pathlib.Path("appstore_screens/final7")
OUT.mkdir(parents=True, exist_ok=True)
HTML = pathlib.Path("bap.html").resolve().as_uri()
SEED = pathlib.Path("seed.js").read_text()

# App Store story order, with deliberate alternating themes (hero dark for impact,
# then dark/light alternating so the listing demonstrates both themes naturally).
#   fname            tab        sub          theme
SCREENS = [
    ("1-hero",       "home",    None,        "dark"),   # Hero / recruiting platform
    ("2-schoolmatch","colleges",None,        "light"),  # School Match / マッチング率
    ("3-ai",         "home",    "assistant", "dark"),   # AI Recruiting Assistant
    ("4-camps",      "camps",   None,        "light"),  # College Camps (real 409)
    ("5-analytics",  "score",   None,        "dark"),   # Recruiting Dashboard / Analytics
    ("6-profile",    "profile", None,        "light"),  # Player Profile
    ("7-coach",      "coach",   None,        "dark"),   # Coach Communication
]

logs = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--force-color-profile=srgb"])
    pg = b.new_page(viewport={"width":430,"height":932}, device_scale_factor=3)
    pg.on("console", lambda m: logs.append(m.text))
    pg.goto(HTML, wait_until="load")
    pg.wait_for_timeout(1500)  # let boot() settle onto auth page
    cd = pathlib.Path("colleges_demo.js")
    if cd.exists():
        pg.evaluate(cd.read_text(encoding="utf-8"))
    pg.evaluate(SEED)
    for fname, tab, sub, theme in SCREENS:
        sub_js = "null" if sub is None else f"'{sub}'"
        pg.evaluate(
            f"() => {{ S.tab='{tab}'; S.sub={sub_js}; S.campLimit=30; "
            f"document.documentElement.setAttribute('data-theme','{theme}'); "
            f"render(); if(typeof scr==='function'){{try{{scr().scrollTop=0;}}catch(e){{}}}} }}"
        )
        pg.wait_for_timeout(450)
        pg.evaluate("() => window.fixEmoji && window.fixEmoji()")
        pg.wait_for_timeout(150)
        pg.screenshot(path=str(OUT / f"raw-{fname}.png"))
        print("wrote", fname, theme)
    b.close()

print("--- last console logs ---")
for l in logs[-15:]:
    print(l)
