const fs = require("fs");

const BASE = "https://cinehd.vc";

async function fetchText(url) {
  // Use playwright via a helper? No, we'll use fetch with headers
  // Cloudflare blocks plain fetch, so we need playwright. But for speed, try fetch first.
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

function parseItems(html) {
  const items = [];
  // Match movie/tv cards: links to /movie/ID or /tv/ID with title, img, rating, year
  // Pattern: href="/movie/123" ... img src="..." ... title ... rating ... year
  const re = /href="(\/(?:movie|tv)\/(\d+))"[\s\S]*?src="([^"]+)"[\s\S]*?alt="([^"]*)"[\s\S]*?(\d\.\d)[\s\S]*?(\d{4})/g;
  // This is fragile; instead parse more carefully
  return items;
}

// Better: parse from the rendered HTML structure
function parsePage(html) {
  const items = [];
  // Find all links to /movie/ or /tv/
  const linkRe = /href="(\/(movie|tv)\/(\d+))"/g;
  const seen = new Set();
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const path = m[1];
    const type = m[2];
    const id = m[3];
    if (seen.has(id)) continue;
    seen.add(id);
    // Find surrounding context for title, poster, rating, year
    const idx = m.index;
    const chunk = html.slice(Math.max(0, idx - 200), idx + 600);
    // poster: wsrv.nl wrapping tmdb image, or direct tmdb
    let poster = "";
    const pm = chunk.match(/src="(https:\/\/wsrv\.nl\/\?url=[^"]+|https:\/\/image\.tmdb\.org[^"]+)"/);
    if (pm) poster = pm[1];
    // title from alt
    let title = "";
    const am = chunk.match(/alt="([^"]*)"/);
    if (am) title = am[1];
    // rating
    let rating = "";
    const rm = chunk.match(/(\d\.\d)/);
    if (rm) rating = rm[1];
    // year
    let year = "";
    const ym = chunk.match(/\b(19\d{2}|20\d{2})\b/);
    if (ym) year = ym[1];
    items.push({ id: Number(id), type, path, title, poster, rating, year });
  }
  return items;
}

async function main() {
  const all = [];
  const seen = new Set();
  for (let p = 1; p <= 500; p++) {
    try {
      const html = await fetchText(`${BASE}/search?page=${p}`);
      const items = parsePage(html);
      let added = 0;
      for (const it of items) {
        if (seen.has(it.id)) continue;
        seen.add(it.id);
        all.push(it);
        added++;
      }
      if (p % 25 === 0 || p === 1) console.log(`page ${p}/500: +${added} (total ${all.length})`);
    } catch (e) {
      console.error(`page ${p} failed: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  fs.writeFileSync("/tmp/hollywood.json", JSON.stringify(all, null, 2));
  console.log(`\nDone: ${all.length} unique items`);
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
PYEOF