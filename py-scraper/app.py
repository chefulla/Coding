from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

app = Flask(__name__)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; UniScraperBot/1.0; +https://example.com/bot)"
}


def is_valid_url(url: str) -> bool:
    parsed = urlparse(url)
    return bool(parsed.scheme) and bool(parsed.netloc)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/scrape", methods=["POST"])
def scrape():
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "Please provide a URL."}), 400

    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    if not is_valid_url(url):
        return jsonify({"error": "That doesn't look like a valid URL."}), 400

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Could not fetch the page: {e}"}), 400

    soup = BeautifulSoup(response.text, "html.parser")

    title = soup.title.string.strip() if soup.title and soup.title.string else "No title found"

    meta_desc_tag = soup.find("meta", attrs={"name": "description"})
    meta_description = meta_desc_tag["content"].strip() if meta_desc_tag and meta_desc_tag.get("content") else "No meta description found"

    headings = []
    for level in ["h1", "h2", "h3"]:
        for tag in soup.find_all(level):
            text = tag.get_text(strip=True)
            if text:
                headings.append({"level": level, "text": text})

    links = []
    seen_links = set()
    for a in soup.find_all("a", href=True):
        href = urljoin(url, a["href"])
        if href not in seen_links and href.startswith(("http://", "https://")):
            seen_links.add(href)
            links.append({"text": a.get_text(strip=True) or "(no text)", "href": href})
        if len(links) >= 50:
            break

    images = []
    seen_images = set()
    for img in soup.find_all("img", src=True):
        src = urljoin(url, img["src"])
        if src not in seen_images:
            seen_images.add(src)
            images.append(src)
        if len(images) >= 30:
            break

    word_count = len(soup.get_text().split())

    return jsonify({
        "url": url,
        "title": title,
        "meta_description": meta_description,
        "word_count": word_count,
        "headings": headings[:50],
        "links": links,
        "images": images,
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)