import html
import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

USERNAME = os.environ.get("GITHUB_USERNAME", "sylenthai")
TOKEN = os.environ.get("GITHUB_TOKEN", "")
OUT_PATH = Path(__file__).resolve().parent.parent / "assets" / "live-telemetry.svg"

LANG_COLORS = {
    "Lean": "#3fb950",
    "Python": "#79c0ff",
    "Kotlin": "#d2a8ff",
    "TypeScript": "#58a6ff",
    "JavaScript": "#e3b341",
    "HTML": "#f0883e",
    "CSS": "#a371f7",
    "Shell": "#56d364",
}


def api_get(url: str):
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": f"{USERNAME}-profile-telemetry",
    }
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))


def collect_metrics() -> dict:
    fallback = {
        "public_repos": 2,
        "followers": 0,
        "stars": 0,
        "languages": [("Lean", 44.0), ("Python", 32.0), ("Kotlin", 14.0), ("TypeScript", 10.0)],
        "events": [
            "push  :: sylenthai/project-genesis (Lean 4.12)",
            "push  :: sylenthai/daily-practise (journal)",
            "build :: sylenthai/sylenthai (telemetry sync)",
        ],
        "source": "baseline",
    }
    try:
        user = api_get(f"https://api.github.com/users/{USERNAME}")
        repos = api_get(f"https://api.github.com/users/{USERNAME}/repos?per_page=100&type=owner")
        events_raw = api_get(f"https://api.github.com/users/{USERNAME}/events/public?per_page=20")

        stars = sum(r.get("stargazers_count", 0) for r in repos)
        lang_bytes: dict[str, int] = {}
        for r in repos:
            if r.get("fork"):
                continue
            lurl = r.get("languages_url")
            if not lurl:
                continue
            try:
                ldata = api_get(lurl)
                for k, v in ldata.items():
                    lang_bytes[k] = lang_bytes.get(k, 0) + int(v)
            except Exception:
                pass

        total_bytes = sum(lang_bytes.values())
        if total_bytes > 0:
            sorted_langs = sorted(lang_bytes.items(), key=lambda x: x[1], reverse=True)[:5]
            languages = [(k, round(v * 100.0 / total_bytes, 1)) for k, v in sorted_langs]
        else:
            languages = fallback["languages"]

        events: list[str] = []
        for ev in events_raw:
            etype = ev.get("type", "").replace("Event", "").lower()
            repo_name = ev.get("repo", {}).get("name", "")
            created = ev.get("created_at", "")[:10]
            if etype and repo_name:
                line = f"{created} · {etype:<6} :: {repo_name}"
                if line not in events:
                    events.append(line)
            if len(events) >= 4:
                break
        if not events:
            events = fallback["events"]

        return {
            "public_repos": user.get("public_repos", fallback["public_repos"]),
            "followers": user.get("followers", 0),
            "stars": stars,
            "languages": languages,
            "events": events,
            "source": "github-api",
        }
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, Exception):
        return fallback


def render_svg(data: dict) -> str:
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    langs = data["languages"]

    # Build stacked bar segments (width = 390)
    bar_x = 24
    bar_w = 390
    cur_x = bar_x
    bar_rects = []
    legend_items = []
    total_pct = sum(p for _, p in langs) or 100.0
    for idx, (lang, pct) in enumerate(langs):
        seg_w = round((pct / total_pct) * bar_w, 1)
        if idx == len(langs) - 1:
            seg_w = round(bar_x + bar_w - cur_x, 1)
        color = LANG_COLORS.get(lang, "#8b949e")
        bar_rects.append(
            f'<rect x="{cur_x}" y="82" width="{max(seg_w, 2)}" height="10" fill="{color}" />'
        )
        cur_x += seg_w

        row_y = 114 + (idx // 2) * 24
        col_x = 24 + (idx % 2) * 205
        legend_items.append(
            f'<circle cx="{col_x + 5}" cy="{row_y - 4}" r="4" fill="{color}" />'
            f'<text x="{col_x + 16}" y="{row_y}" font-family="\'Cascadia Code\', Consolas, monospace" '
            f'font-size="11" fill="#c9d1d9">{html.escape(lang)} <tspan fill="#8b949e">{pct:.1f}%</tspan></text>'
        )

    event_lines = []
    for i, ev in enumerate(data["events"][:4]):
        ey = 96 + i * 24
        clipped = html.escape(ev[:52])
        event_lines.append(
            f'<text x="458" y="{ey}" font-family="\'Cascadia Code\', Consolas, monospace" '
            f'font-size="11" fill="#8b949e"><tspan fill="#3fb950">&gt;</tspan> {clipped}</text>'
        )

    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="880" height="205" viewBox="0 0 880 205" fill="none">
  <rect x="1" y="1" width="878" height="203" rx="10" fill="#0b0f14" stroke="#21262d" stroke-width="1.2" />

  <text x="24" y="27" font-family="'Cascadia Code', Consolas, monospace" font-size="11" font-weight="600" letter-spacing="1.4" fill="#6e7681">LIVE TELEMETRY // AUTO-SYNCED VIA GITHUB ACTIONS</text>
  <text x="856" y="27" text-anchor="end" font-family="'Cascadia Code', Consolas, monospace" font-size="10.5" fill="#6e7681">SYNC: {html.escape(now_str)}</text>
  <line x1="20" y1="38" x2="860" y2="38" stroke="#161b22" stroke-width="1" />

  <!-- Divider -->
  <line x1="436" y1="38" x2="436" y2="204" stroke="#161b22" stroke-width="1" />

  <!-- Left Pane: Languages & Counts -->
  <text x="24" y="64" font-family="'Cascadia Code', Consolas, monospace" font-size="11.5" font-weight="700" fill="#e6edf3">LANGUAGE_SPECTRUM</text>
  <clipPath id="barClip"><rect x="24" y="82" width="390" height="10" rx="5" /></clipPath>
  <rect x="24" y="82" width="390" height="10" rx="5" fill="#161b22" />
  <g clip-path="url(#barClip)">
    {"".join(bar_rects)}
  </g>
  {"".join(legend_items)}

  <line x1="24" y1="168" x2="414" y2="168" stroke="#161b22" stroke-width="1" />
  <text x="24" y="188" font-family="'Cascadia Code', Consolas, monospace" font-size="11" fill="#8b949e">
    REPOS: <tspan fill="#e6edf3" font-weight="700">{data['public_repos']}</tspan>   ·   STARS: <tspan fill="#3fb950" font-weight="700">{data['stars']}</tspan>   ·   FOLLOWERS: <tspan fill="#79c0ff" font-weight="700">{data['followers']}</tspan>
  </text>

  <!-- Right Pane: Event Stream -->
  <text x="458" y="64" font-family="'Cascadia Code', Consolas, monospace" font-size="11.5" font-weight="700" fill="#e6edf3">RECENT_EVENT_STREAM</text>
  {"".join(event_lines)}
  <text x="458" y="188" font-family="'Cascadia Code', Consolas, monospace" font-size="10.5" fill="#6e7681">SOURCE: {html.escape(data['source'])} · @sylenthai</text>
</svg>
"""


def main() -> None:
    data = collect_metrics()
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(render_svg(data), encoding="utf-8")
    print(f"Wrote {OUT_PATH} (source={data['source']})")


if __name__ == "__main__":
    main()
