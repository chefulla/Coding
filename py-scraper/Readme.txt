# University Web Scraper

This is a small web scraper with a Flask backend and a simple HTML/CSS/JS frontend, containerized with Docker.

## What it does

Enter any URL and it fetches:
- Page title
- Meta description
- Word count
- All headings (h1–h3)
- All links (up to 50)
- All images (up to 30)

---


---

## Setting the project up on a new computer

### 1. Make sure you have installed Docker Desktop!

Docker Desktop is the only requirement — it includes everything needed (Python, dependencies, etc. all run inside the container, so you don't need Python installed separately on your machine).

- **Windows / Mac:** download from https://www.docker.com/products/docker-desktop/
  
Verify it's installed by opening the pc terminal (or the terminal in the IDE) and running:
```bash
docker --version
docker compose version
```
Both should print a version number, not an error.

### 2. Get the project files


If it's in a Git repository instead:
```bash
git clone <repository-url>
cd py-scraper
```

### 3. Open a terminal in the project folder

**Using VS Code (recommended):**
1. Open VS Code
2. `File → Open Folder` → select the `py-scraper` folder
3. Open a terminal inside VS Code: `Terminal → New Terminal`
   - This automatically starts you in the correct folder

**Using Terminal/Command Prompt directly:**
```bash
cd path/to/py-scraper
```

Confirm you're in the right place — this command should list `Dockerfile`, `docker-compose.yml`, `app.py`, etc.:
```bash
ls -la
```
(On Windows Command Prompt, use `dir` instead of `ls -la`.)

### 4. Build and run

```bash
docker compose up --build
```

First run takes a minute or two — it downloads the Python base image and installs Flask, requests, BeautifulSoup, and gunicorn. You'll know it worked when you see a line like:
```
[INFO] Listening at: http://0.0.0.0:5000
```

Leave this terminal window open — it needs to keep running for the app to stay accessible.

### 5. Open the app

In any browser, go to:
```
http://localhost:5000
```

Enter a URL in the input box and click **Scrape**.

### 6. Stopping the app

Press `Ctrl+C` in the terminal where it's running, then:
```bash
docker compose down
```

### 7. Running it again later

Once already built, you can just run:
```bash
docker compose up
```
(You only need `--build` again if you change the code or dependencies.)

---

## Example URLs to try

- wikipedia.org
- en.wikipedia.org/wiki/Web_scraping
- bbc.com/news
- github.com
- news.ycombinator.com
- python.org
- quotes.toscrape.com  — built specifically for testing scrapers
- books.toscrape.com   — also built for testing scrapers
- example.com          — minimal test page

## Sites that won't work well

Sites that load their content with JavaScript (rather than plain HTML) won't scrape properly with this tool, since it only fetches the raw HTML — it doesn't run JavaScript like a real browser does. Examples: youtube.com, most Google pages, and many modern single-page apps (React/Vue-based sites).

`quotes.toscrape.com` and `books.toscrape.com` are purpose-built sandbox sites made specifically for practicing web scraping, so they're good starting points if you want guaranteed clean results.

---

## Troubleshooting

**"no configuration file provided" error**
You're not in the project folder. Run `pwd` (Mac/Linux) or `cd` (Windows, no arguments) to check where you are, then `cd` into the `py-scraper` folder.

**"no such file or directory" when trying to `cd`**
Double check the exact folder name and path with `ls -la` (Mac/Linux) or `dir` (Windows) in the parent folder — watch out for typos, spaces, or case differences.

**"failed to read dockerfile: no such file or directory"**
The file must be named exactly `Dockerfile` (capital D, rest lowercase). Rename it if needed:
```bash
mv DockerFile Dockerfile
```

**Port 5000 already in use**
Another program is using that port. Either stop it, or change the port in `docker-compose.yml`, e.g.:
```yaml
ports:
  - "5001:5000"
```
Then visit `http://localhost:5001` instead.

**`docker: command not found`**
Docker Desktop isn't installed or isn't running. Open the Docker Desktop app and wait for it to fully start before trying again.

---

## Notes

- The scraper only follows plain GET requests (no JavaScript-rendered pages), which is fine for most static sites.
- A custom User-Agent is set so requests aren't blocked by basic bot filters.
- Respect `robots.txt` and each site's terms of service when scraping for your assignment.