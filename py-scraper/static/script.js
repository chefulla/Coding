const form = document.getElementById("scrape-form");
const urlInput = document.getElementById("url-input");
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const scrapeBtn = document.getElementById("scrape-btn");

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  if (!url) return;

  setLoading(true);
  resultsEl.classList.add("hidden");

  try {
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    if (!res.ok) {
      showStatus(data.error || "Something went wrong.", true);
      return;
    }

    showStatus("");
    renderResults(data);
  } catch (err) {
    showStatus("Network error: could not reach the server.", true);
  } finally {
    setLoading(false);
  }
});

function setLoading(isLoading) {
  scrapeBtn.disabled = isLoading;
  scrapeBtn.textContent = isLoading ? "Scraping..." : "Scrape";
  if (isLoading) showStatus("Fetching and parsing page...", false, true);
}

function showStatus(message, isError = false, isLoadingMsg = false) {
  statusEl.textContent = message;
  statusEl.className = "";
  if (isError) statusEl.classList.add("error");
  if (isLoadingMsg) statusEl.classList.add("loading");
}

function renderResults(data) {
  document.getElementById("result-title").textContent = data.title;
  document.getElementById("result-url").textContent = data.url;
  document.getElementById("result-meta").textContent = data.meta_description;
  document.getElementById("result-wordcount").textContent = data.word_count;

  const headingsList = document.getElementById("headings-list");
  headingsList.innerHTML = "";
  if (data.headings.length === 0) {
    headingsList.innerHTML = "<li>No headings found.</li>";
  } else {
    data.headings.forEach(h => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="tag">${h.level.toUpperCase()}</span>${escapeHtml(h.text)}`;
      headingsList.appendChild(li);
    });
  }

  const linksList = document.getElementById("links-list");
  linksList.innerHTML = "";
  if (data.links.length === 0) {
    linksList.innerHTML = "<li>No links found.</li>";
  } else {
    data.links.forEach(l => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = l.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = l.text.length > 60 ? l.text.slice(0, 60) + "…" : l.text;
      li.appendChild(a);
      linksList.appendChild(li);
    });
  }

  const imagesGrid = document.getElementById("images-grid");
  imagesGrid.innerHTML = "";
  if (data.images.length === 0) {
    imagesGrid.innerHTML = "<p>No images found.</p>";
  } else {
    data.images.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.onerror = () => { img.style.display = "none"; };
      imagesGrid.appendChild(img);
    });
  }

  resultsEl.classList.remove("hidden");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}