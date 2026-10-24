const fs = require("fs");

const BASE = "https://www.watchfilmy.to";
const CATEGORIES = [
  "bollywood-movies",
  "bollywood-movies-2026",
  "hindi-dubbed-movies",
  "punjabi-movies",
  "punjabi-movies-2026",
  "seasons-webseries",
];

// Parse movie cards from a listing page HTML
function parseCards(html) {
  const cards = [];
  // Match p-wrap blocks
  const re = /<div class="p-wrap p-grid p-grid-1"[^>]*data-pid="(\d+)"[\s\S]*?<a class="p-flink"[^>]*href="([^"]+)"[^>]*title="([^"]*)"[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<h3 class="entry-title">[\s\S]*?<a class="p-url"[^>]*href="[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const [, pid, url, titleAttr, poster, titleHtml] = m;
    const title = titleHtml.replace(/<[^>]+>/g, "").trim().replace(/&#8211;/g, "–").replace(/&#8217;/g, "'").replace(/&amp;/g, "&").replace(/&#038;/g, "&");
    const slug = url.replace(BASE + "/", "").replace(/\/$/, "");
    cards.push({ id: Number(pid), url, title, poster, slug });
  }
  return cards;
}

// Parse last page number from pagination
function parseLastPage(html) {
  // Look for page links like /page/89/
  const matches = [...html.matchAll(/\/page\/(\d+)\//g)];
  if (matches.length === 0) return 1;
  return Math.max(...matches.map((m) => Number(m[1])));
}

// Fetch with retry
async function fetchText(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

// Parse single movie page for synopsis + actors
function parseDetail(html) {
  // synopsis: first <p> after entry-content, before Actors
  let synopsis = "";
  const synMatch = html.match(/<div class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  if (synMatch) {
    const content = synMatch[1];
    // remove iframe
    const text = content.replace(/<iframe[\s\S]*?<\/iframe>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    // extract up to "Actors:"
    const idx = text.indexOf("Actors:");
    synopsis = (idx > 0 ? text.slice(0, idx) : text).trim();
  }
  let actors = [];
  const actorMatch = html.match(/Actors:<\/strong>\s*([^<]+)/i) || html.match(/<strong>Actors:<\/strong>\s*([^<]+)/i);
  if (actorMatch) {
    actors = actorMatch[1].split(",").map((a) => a.trim()).filter(Boolean);
  }
  // fallback: search in text
  if (actors.length === 0) {
    const m2 = html.match(/Actors:\s*<\/strong>\s*([^<]+)/i);
    if (m2) actors = m2[1].split(",").map((a) => a.trim()).filter(Boolean);
  }
  // extract primary player embed url (first iframe in entry content)
  let embedUrl = "";
  const entryMatch = html.match(/<div class="entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/);
  const scope = entryMatch ? entryMatch[1] : html;
  const iframeMatch = scope.match(/<iframe[^>]*src="([^"]+)"/i);
  if (iframeMatch) embedUrl = iframeMatch[1].trim();
  // fallback: first iframe anywhere
  if (!embedUrl) {
    const m2 = html.match(/<iframe[^>]*src="([^"]+)"/i);
    if (m2) embedUrl = m2[1].trim();
  }
  return { synopsis, actors, embedUrl };
}

// Concurrency limiter
function makeLimiter(concurrency) {
  let running = 0;
  const queue = [];
  function run(fn) {
    return new Promise((resolve, reject) => {
      const exec = () => {
        running++;
        fn().then(resolve, reject).finally(() => {
          running--;
          if (queue.length) queue.shift()();
        });
      };
      if (running < concurrency) exec();
      else queue.push(exec);
    });
  }
  return run;
}

const limit = makeLimiter(6);

async function main() {
  const allCards = new Map(); // slug -> card
  const categoryMap = {}; // slug -> category slugs

  // Step 1: scrape listing pages
  for (const cat of CATEGORIES) {
    console.log(`\n=== Category: ${cat} ===`);
    // page 1
    const firstUrl = `${BASE}/category/${cat}/`;
    const firstHtml = await fetchText(firstUrl);
    const lastPage = parseLastPage(firstHtml);
    console.log(`  total pages: ${lastPage}`);
    const pages = [firstHtml];
    for (let p = 2; p <= lastPage; p++) {
      const html = await fetchText(`${BASE}/category/${cat}/page/${p}/`);
      pages.push(html);
      if (p % 10 === 0) console.log(`  fetched page ${p}/${lastPage}`);
    }
    let count = 0;
    for (const html of pages) {
      const cards = parseCards(html);
      for (const c of cards) {
        if (!allCards.has(c.slug)) {
          allCards.set(c.slug, c);
          categoryMap[c.slug] = [cat];
        } else {
          if (!categoryMap[c.slug].includes(cat)) categoryMap[c.slug].push(cat);
        }
        count++;
      }
    }
    console.log(`  cards found: ${count} (unique total: ${allCards.size})`);
  }

  console.log(`\nTotal unique movies: ${allCards.size}`);

  // Step 2: scrape detail pages for synopsis + actors
  const movies = [];
  let done = 0;
  const total = allCards.size;
  const entries = [...allCards.entries()];

  await Promise.all(
    entries.map(([slug, card]) =>
      limit(async () => {
        try {
          const html = await fetchText(`${BASE}/${slug}/`);
          const { synopsis, actors, embedUrl } = parseDetail(html);
          movies.push({
            id: card.id,
            slug: card.slug,
            title: card.title,
            poster: card.poster,
            categories: categoryMap[slug],
            synopsis: synopsis || "No synopsis available.",
            actors: actors.length ? actors : [],
            embedUrl: embedUrl || "https://wf.strp2p.site/#jvrclo",
          });
        } catch (e) {
          console.error(`  FAILED ${slug}: ${e.message}`);
          movies.push({
            id: card.id,
            slug: card.slug,
            title: card.title,
            poster: card.poster,
            categories: categoryMap[slug],
            synopsis: "No synopsis available.",
            actors: [],
            embedUrl: "https://wf.strp2p.site/#jvrclo",
          });
        }
        done++;
        if (done % 50 === 0) console.log(`  details: ${done}/${total}`);
      })
    )
  );

  // Sort by id desc (newest-ish)
  movies.sort((a, b) => b.id - a.id);

  // Step 3: extract year and language from title
  function parseTitle(title) {
    // "Sultan (2016) Hindi" -> title, year, language
    const m = title.match(/^(.*?)\s*\((\d{4})\)\s*(.*)$/);
    if (m) {
      return { name: m[1].trim(), year: Number(m[2]), language: m[3].trim() || "Hindi" };
    }
    return { name: title, year: new Date().getFullYear(), language: "Hindi" };
  }

  const finalMovies = movies.map((m) => {
    const { name, year, language } = parseTitle(m.title);
    return {
      id: m.id,
      slug: m.slug,
      title: name,
      year,
      language,
      synopsis: m.synopsis,
      actors: m.actors,
      categories: m.categories,
      poster: m.poster,
      embedUrl: m.embedUrl || "https://wf.strp2p.site/#jvrclo",
    };
  });

  // Write a JSON dump first for safety
  fs.writeFileSync("/tmp/movies.json", JSON.stringify(finalMovies, null, 2));
  console.log(`\nWrote /tmp/movies.json with ${finalMovies.length} movies`);

  // Generate data.ts
  const cats = [
    { name: "Bollywood Movies", slug: "bollywood-movies" },
    { name: "Bollywood Movies 2026", slug: "bollywood-movies-2026", parent: "bollywood-movies" },
    { name: "Hindi Dubbed Movies", slug: "hindi-dubbed-movies" },
    { name: "Punjabi Movies", slug: "punjabi-movies" },
    { name: "Punjabi Movies 2026", slug: "punjabi-movies-2026", parent: "punjabi-movies" },
    { name: "Seasons / WebSeries", slug: "seasons-webseries" },
  ];

  const esc = (s) => JSON.stringify(s);

  let out = `import { Movie } from "./types";\n\n`;
  out += `export const MOVIES: Movie[] = [\n`;
  for (const m of finalMovies) {
    out += `  {\n`;
    out += `    id: ${m.id},\n`;
    out += `    slug: ${esc(m.slug)},\n`;
    out += `    title: ${esc(m.title)},\n`;
    out += `    year: ${m.year},\n`;
    out += `    language: ${esc(m.language)},\n`;
    out += `    synopsis: ${esc(m.synopsis)},\n`;
    out += `    actors: [${m.actors.map(esc).join(", ")}],\n`;
    out += `    categories: [${m.categories.map(esc).join(", ")}],\n`;
    out += `    poster: ${esc(m.poster)},\n`;
    out += `    embedUrl: ${esc(m.embedUrl)},\n`;
    out += `    createdAt: "2026-01-01",\n`;
    out += `  },\n`;
  }
  out += `];\n\n`;

  // FEATURED: first 12
  out += `export const FEATURED_IDS = [${finalMovies.slice(0, 12).map((m) => m.id).join(", ")}];\n\n`;

  out += `export function getMovieBySlug(slug: string): Movie | undefined {\n  return MOVIES.find((m) => m.slug === slug);\n}\n\n`;
  out += `export function getMoviesByCategory(slug: string): Movie[] {\n  return MOVIES.filter((m) => m.categories.includes(slug)).sort(\n    (a, b) => (b.id || 0) - (a.id || 0)\n  );\n}\n\n`;
  out += `export function searchMovies(q: string): Movie[] {\n  const query = q.trim().toLowerCase();\n  if (!query) return [];\n  return MOVIES.filter(\n    (m) =>\n      m.title.toLowerCase().includes(query) ||\n      m.actors.some((a) => a.toLowerCase().includes(query)) ||\n      m.categories.some((c) => c.toLowerCase().includes(query))\n  );\n}\n\n`;
  out += `export function paginate<T>(items: T[], page: number, perPage: number) {\n  const total = items.length;\n  const totalPages = Math.max(1, Math.ceil(total / perPage));\n  const safePage = Math.min(Math.max(1, page), totalPages);\n  const start = (safePage - 1) * perPage;\n  return { items: items.slice(start, start + perPage), page: safePage, totalPages, total };\n}\n`;

  fs.writeFileSync("/Users/preesoft-mac2/revDSM/PP/watchfilmy-next/src/lib/data.ts", out);
  console.log(`\nWrote data.ts with ${finalMovies.length} movies`);
}

main().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
