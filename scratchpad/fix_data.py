import json, html, os

BASE = "/Users/preesoft-mac2/revDSM/PP/watchfilmy-next"
data = json.load(open("/tmp/movies.json"))

# unescape html entities
for m in data:
    m["title"] = html.unescape(m["title"])
    m["synopsis"] = html.unescape(m["synopsis"])
    m["actors"] = [html.unescape(a) for a in m["actors"]]
    # clean extra whitespace
    m["synopsis"] = " ".join(m["synopsis"].split())
    m["title"] = " ".join(m["title"].split())

# parse year/language from title
final = []
for m in data:
    final.append({
        "id": m["id"],
        "slug": m["slug"],
        "title": m["title"],
        "year": m.get("year", 2026),
        "language": m.get("language", "Hindi"),
        "synopsis": m["synopsis"],
        "actors": m["actors"],
        "categories": m["categories"],
        "poster": m["poster"],
        "embedUrl": m["embedUrl"],
    })

final.sort(key=lambda x: -x["id"])

def esc(s):
    return json.dumps(s, ensure_ascii=False)

cats = [
    {"name": "Bollywood Movies", "slug": "bollywood-movies"},
    {"name": "Bollywood Movies 2026", "slug": "bollywood-movies-2026", "parent": "bollywood-movies"},
    {"name": "Hindi Dubbed Movies", "slug": "hindi-dubbed-movies"},
    {"name": "Punjabi Movies", "slug": "punjabi-movies"},
    {"name": "Punjabi Movies 2026", "slug": "punjabi-movies-2026", "parent": "punjabi-movies"},
    {"name": "Seasons / WebSeries", "slug": "seasons-webseries"},
]

out = 'import { Movie } from "./types";\n\n'
out += "export const MOVIES: Movie[] = [\n"
for m in final:
    out += "  {\n"
    out += f"    id: {m['id']},\n"
    out += f"    slug: {esc(m['slug'])},\n"
    out += f"    title: {esc(m['title'])},\n"
    out += f"    year: {m['year']},\n"
    out += f"    language: {esc(m['language'])},\n"
    out += f"    synopsis: {esc(m['synopsis'])},\n"
    out += f"    actors: [{', '.join(esc(a) for a in m['actors'])}],\n"
    out += f"    categories: [{', '.join(esc(c) for c in m['categories'])}],\n"
    out += f"    poster: {esc(m['poster'])},\n"
    out += f"    embedUrl: {esc(m['embedUrl'])},\n"
    out += '    createdAt: "2026-01-01",\n'
    out += "  },\n"
out += "];\n\n"
out += f"export const FEATURED_IDS = [{', '.join(str(m['id']) for m in final[:12])}];\n\n"
out += '''export function getMovieBySlug(slug: string): Movie | undefined {
  return MOVIES.find((m) => m.slug === slug);
}

export function getMoviesByCategory(slug: string): Movie[] {
  return MOVIES.filter((m) => m.categories.includes(slug)).sort(
    (a, b) => (b.id || 0) - (a.id || 0)
  );
}

export function searchMovies(q: string): Movie[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  return MOVIES.filter(
    (m) =>
      m.title.toLowerCase().includes(query) ||
      m.actors.some((a) => a.toLowerCase().includes(query)) ||
      m.categories.some((c) => c.toLowerCase().includes(query))
  );
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return { items: items.slice(start, start + perPage), page: safePage, totalPages, total };
}
'''

with open(f"{BASE}/src/lib/data.ts", "w") as f:
    f.write(out)

print(f"Wrote {len(final)} movies to data.ts")
PYEOF