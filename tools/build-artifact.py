#!/usr/bin/env python3
"""Bundle the app into one HTML file for publishing as a claude.ai artifact.

The artifact host wraps the page in its own <!doctype>/<head>/<body>, blocks
service workers, and only serves files it is given, so this inlines the CSS
and JS and drops the PWA bits. Output: dist/health-coach.html
"""
import pathlib, re

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / "index.html").read_text()

body = re.search(r"<body>(.*)</body>", html, re.S).group(1)
title = re.search(r"<title>.*?</title>", html).group(0)
css = (root / "css/styles.css").read_text()

# inline each local script in order
def inline(m):
    src = m.group(1)
    return "<script>\n" + (root / src).read_text() + "\n</script>"
body = re.sub(r'<script src="(js/[^"]+)"></script>', inline, body)

out = f"{title}\n<style>\n{css}\n</style>\n{body.strip()}\n"
dist = root / "dist"
dist.mkdir(exist_ok=True)
(dist / "health-coach.html").write_text(out)
print(f"wrote dist/health-coach.html ({len(out) // 1024} KB)")
