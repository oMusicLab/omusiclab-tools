#!/usr/bin/env python3
"""Mirror legacy tool sites into legacy/<name>/. Strips <base> for local serving."""

from __future__ import annotations

import re
import ssl
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urljoin, urlparse, unquote
from urllib.request import Request, urlopen

USER_AGENT = "Mozilla/5.0 (compatible; omusiclab-tools-mirror/1.0)"
CSS_URL_RE = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""", re.I)
CSS_IMPORT_RE = re.compile(
    r"""@import\s+(?:url\(\s*['"]?([^'")]+)['"]?\s*\)|['"]([^'"]+)['"])""", re.I
)
SKIP_SCHEMES = ("data:", "mailto:", "javascript:", "#")


class AssetParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.assets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = {k: v for k, v in attrs if v}
        if tag == "link" and attrs_dict.get("rel") == "stylesheet":
            if "href" in attrs_dict:
                self.assets.append(attrs_dict["href"])
        if tag in ("script", "img", "source"):
            if "src" in attrs_dict:
                self.assets.append(attrs_dict["src"])


def safe_request_url(url: str) -> str:
    parsed = urlparse(url)
    path = quote(unquote(parsed.path), safe="/:@")
    return parsed._replace(path=path).geturl()


def fetch_bytes(url: str) -> bytes:
    req = Request(safe_request_url(url), headers={"User-Agent": USER_AGENT})
    with urlopen(req, context=ssl.create_default_context(), timeout=60) as resp:
        return resp.read()


def fetch_text(url: str) -> str:
    data = fetch_bytes(url)
    for encoding in ("utf-8", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def normalize_url(url: str, base: str) -> str | None:
    if not url or url.startswith(SKIP_SCHEMES):
        return None
    if url.startswith("//"):
        parsed_base = urlparse(base)
        url = f"{parsed_base.scheme}:{url}"
    joined = urljoin(base, url)
    parsed = urlparse(joined)
    if parsed.scheme not in ("http", "https"):
        return None
    return joined.split("#")[0]


def local_path_for_url(file_url: str, site_root_url: str, out_dir: Path) -> Path:
    site = urlparse(site_root_url)
    parsed = urlparse(file_url)
    if parsed.netloc != site.netloc:
        raise ValueError(f"off-site url: {file_url}")
    rel = parsed.path
    prefix = site.path.rstrip("/")
    if prefix and rel.startswith(prefix):
        rel = rel[len(prefix) :]
    rel = rel.lstrip("/")
    if not rel or rel.endswith("/"):
        rel = rel + "index.html"
    return out_dir / rel


def css_assets(css_text: str, css_url: str) -> list[str]:
    found: list[str] = []
    for match in CSS_URL_RE.finditer(css_text):
        found.append(match.group(1))
    for match in CSS_IMPORT_RE.finditer(css_text):
        found.append(match.group(1) or match.group(2))
    urls: list[str] = []
    for item in found:
        normalized = normalize_url(item, css_url)
        if normalized:
            urls.append(normalized)
    return urls


def html_assets(html_text: str, page_url: str) -> list[str]:
    parser = AssetParser()
    parser.feed(html_text)
    urls: list[str] = []
    for item in parser.assets:
        normalized = normalize_url(item, page_url)
        if normalized:
            urls.append(normalized)
    return urls


def remove_base_tag(html_text: str) -> str:
    return re.sub(r"\s*<base\b[^>]*>\s*", "\n", html_text, count=1, flags=re.I)


def mirror_site(site_url: str, out_dir: Path) -> None:
    site_url = site_url if site_url.endswith("/") else site_url + "/"
    parsed_site = urlparse(site_url)
    site_prefix = parsed_site.path.rstrip("/")

    if out_dir.exists():
        import shutil

        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    queue: list[str] = [site_url]
    seen: set[str] = set()

    while queue:
        url = queue.pop(0)
        if url in seen:
            continue
        seen.add(url)

        parsed = urlparse(url)
        if parsed.netloc != parsed_site.netloc:
            continue
        if site_prefix and not parsed.path.startswith(site_prefix):
            continue

        try:
            raw = fetch_bytes(url)
        except (HTTPError, URLError) as err:
            print(f"skip {url}: {err}", file=sys.stderr)
            continue

        dest = local_path_for_url(url, site_url, out_dir)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(raw)
        print(f"saved {dest.relative_to(out_dir.parent.parent)}")

        lower_url = url.lower()
        is_html = lower_url.endswith(".html") or lower_url.endswith("/") or dest.name == "index.html"
        is_css = lower_url.endswith(".css")

        if not (is_html or is_css):
            continue

        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            text = raw.decode("latin-1", errors="replace")

        assets: list[str] = []
        if is_html:
            if dest.name == "index.html" or url.rstrip("/") == site_url.rstrip("/"):
                text = remove_base_tag(text)
                dest.write_text(text, encoding="utf-8")
            assets = html_assets(text, url)
        if is_css:
            assets.extend(css_assets(text, url))

        for asset_url in assets:
            if asset_url not in seen:
                queue.append(asset_url)

        time.sleep(0.05)

    print(f"done -> {out_dir}")


def mirror_piano(site_url: str, out_dir: Path) -> None:
    site_url = site_url if site_url.endswith("/") else site_url + "/"
    instrument_root = site_url.rsplit("piano/", 1)[0]

    if out_dir.exists():
        import shutil

        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    html = remove_base_tag(fetch_text(site_url))
    html_paths = [
        "../favicon.ico",
        "../assets/sass/css/omusic.css",
        "../assets/sass/css/piano.css",
        "../node_modules/tone/build/Tone.js",
        "../node_modules/jquery/dist/jquery.min.js",
        "../assets/js/chordformula.js",
        "../assets/js/piano.js",
    ]
    local_paths = {
        "../favicon.ico": "favicon.ico",
        "../assets/sass/css/omusic.css": "assets/sass/css/omusic.css",
        "../assets/sass/css/piano.css": "assets/sass/css/piano.css",
        "../node_modules/tone/build/Tone.js": "vendor/tone/Tone.js",
        "../node_modules/jquery/dist/jquery.min.js": "vendor/jquery/jquery.min.js",
        "../assets/js/chordformula.js": "assets/js/chordformula.js",
        "../assets/js/piano.js": "assets/js/piano.js",
    }

    for src, local in local_paths.items():
        html = html.replace(f'"{src}"', f'"{local}"').replace(f"'{src}'", f"'{local}'")

    queue = [normalize_url(src, site_url) for src in html_paths]
    seen: set[str] = set()

    while queue:
        url = queue.pop(0)
        if not url or url in seen:
            continue
        seen.add(url)
        if not url.startswith(instrument_root):
            continue

        rel = url[len(instrument_root) :].lstrip("/")
        local = local_paths.get("../" + rel, rel)
        dest = out_dir / local
        dest.parent.mkdir(parents=True, exist_ok=True)

        try:
            data = fetch_bytes(url)
        except (HTTPError, URLError) as err:
            print(f"skip {url}: {err}", file=sys.stderr)
            continue

        dest.write_bytes(data)
        print(f"saved legacy/piano/{local}")

        if local.endswith(".css"):
            text = data.decode("utf-8", errors="replace")
            for asset_url in css_assets(text, url):
                if asset_url.startswith(instrument_root) and asset_url not in seen:
                    queue.append(asset_url)

        time.sleep(0.05)

    (out_dir / "index.html").write_text(html, encoding="utf-8")
    print("saved legacy/piano/index.html")


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "legacy"
    for url, path in [
        ("https://musictools.chiedimla.com/chord-diagram-generator/", root / "chord-diagram-generator"),
        ("https://musictools.chiedimla.com/tabs-generator/", root / "tabs-generator"),
        ("https://musictools.chiedimla.com/scale-generator/", root / "scale-generator"),
    ]:
        print(f"\n=== {path.name} ===")
        mirror_site(url, path)

    print("\n=== piano ===")
    mirror_piano("https://omusiclab.com/virtual-instrument/piano/", root / "piano")


if __name__ == "__main__":
    main()
