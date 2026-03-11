const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const exportBtn = document.getElementById("export");
const clearBtn = document.getElementById("clear");
const searchEl = document.getElementById("search");

let allEndpoints = [];

function showStatus(text, duration = 2000) {
  statusEl.textContent = text;
  statusEl.style.display = "block";
  setTimeout(() => { statusEl.style.display = "none"; }, duration);
}

function renderEndpoints(endpoints) {
  if (!endpoints.length) {
    listEl.innerHTML = '<div class="empty">No JSONP endpoints discovered yet.<br>Browse around to find some.</div>';
    return;
  }
  listEl.innerHTML = endpoints
    .slice()
    .reverse()
    .map((e, i) => {
      const time = new Date(e.timestamp).toLocaleString();
      const snippetHtml = e.snippet
        ? `<div class="snippet"><code>${escapeHtml(e.snippet)}</code></div>`
        : "";
      return `<div class="endpoint">
        <div class="url">${escapeHtml(e.url)}</div>
        ${snippetHtml}
        <div class="meta">
          <span>param: <b>${escapeHtml(e.param)}</b></span>
          <span>${time}</span>
          <button class="copy-btn" data-idx="${i}">Copy URL</button>
        </div>
      </div>`;
    })
    .join("");

  // Wire up copy buttons
  const reversed = endpoints.slice().reverse();
  listEl.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      const ep = reversed[btn.dataset.idx];
      try {
        await navigator.clipboard.writeText(ep.probeUrl);
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy URL"; }, 1500);
      } catch {
        showStatus("Copy failed.");
      }
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function filterEndpoints() {
  const q = searchEl.value.toLowerCase();
  if (!q) return renderEndpoints(allEndpoints);
  renderEndpoints(allEndpoints.filter((e) =>
    e.url.toLowerCase().includes(q) ||
    e.param.toLowerCase().includes(q) ||
    (e.snippet && e.snippet.toLowerCase().includes(q))
  ));
}

function loadEndpoints() {
  chrome.runtime.sendMessage({ action: "getEndpoints" }, (endpoints) => {
    allEndpoints = endpoints || [];
    filterEndpoints();
  });
}

searchEl.addEventListener("input", filterEndpoints);

exportBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "getEndpoints" }, async (endpoints) => {
    if (!endpoints || !endpoints.length) {
      showStatus("Nothing to export.");
      return;
    }
    const json = JSON.stringify(endpoints, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      showStatus("Copied to clipboard!");
    } catch {
      // Fallback: download as file
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "callme-endpoints.json";
      a.click();
      URL.revokeObjectURL(url);
      showStatus("Downloaded as file.");
    }
  });
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all discovered endpoints?")) return;
  chrome.runtime.sendMessage({ action: "clearEndpoints" }, () => {
    allEndpoints = [];
    searchEl.value = "";
    renderEndpoints([]);
    showStatus("Cleared.");
  });
});

loadEndpoints();
