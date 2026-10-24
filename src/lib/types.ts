export interface Movie {
  id: number;
  slug: string;
  title: string;
  year: number;
  language: string;
  synopsis: string;
  actors: string[];
  categories: string[];
  poster: string;
  backdrop?: string;
  embedUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

export interface Category {
  name: string;
  slug: string;
  parent?: string;
}

export const CATEGORIES: Category[] = [
  { name: "Bollywood Movies", slug: "bollywood-movies" },
  { name: "Bollywood Movies 2026", slug: "bollywood-movies-2026", parent: "bollywood-movies" },
  { name: "Hindi Dubbed Movies", slug: "hindi-dubbed-movies" },
  { name: "Punjabi Movies", slug: "punjabi-movies" },
  { name: "Punjabi Movies 2026", slug: "punjabi-movies-2026", parent: "punjabi-movies" },
  { name: "Seasons / WebSeries", slug: "seasons-webseries" },
];
