import Link from "next/link";
import { Film } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-bg-elev)]">
      <div className="container-x py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent)] text-white">
              <Film size={16} />
            </span>
            <span className="font-display font-extrabold text-lg">
              all<span className="text-[var(--color-accent)]">movies</span>
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-dim)] leading-relaxed">
            Your one stop source for the latest Indian movies. Watch and discuss your
            favourites online.
          </p>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-text-faint)] mb-3">
            Categories
          </h4>
          <ul className="space-y-2 text-sm text-[var(--color-text-dim)]">
            <li><Link href="/hollywood" className="hover:text-[var(--color-text)]">Hollywood</Link></li>
            <li><Link href="/category/bollywood-movies" className="hover:text-[var(--color-text)]">Bollywood Movies</Link></li>
            <li><Link href="/category/hindi-dubbed-movies" className="hover:text-[var(--color-text)]">Hindi Dubbed Movies</Link></li>
            <li><Link href="/category/punjabi-movies" className="hover:text-[var(--color-text)]">Punjabi Movies</Link></li>
            <li><Link href="/category/seasons-webseries" className="hover:text-[var(--color-text)]">Seasons / WebSeries</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[var(--color-text-faint)] mb-3">
            About
          </h4>
          <ul className="space-y-2 text-sm text-[var(--color-text-dim)]">
            <li><Link href="/" className="hover:text-[var(--color-text)]">Home</Link></li>
            <li><Link href="/hollywood" className="hover:text-[var(--color-text)]">Hollywood</Link></li>
            <li><Link href="/category/bollywood-movies" className="hover:text-[var(--color-text)]">Bollywood</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)]">
        <div className="container-x py-4 text-xs text-[var(--color-text-faint)] flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} allmovies. All rights reserved.</span>
          <span>Built with Next.js &amp; Tailwind CSS</span>
        </div>
      </div>
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
        <div className="container-x py-3 text-[11px] text-[var(--color-text-faint)] text-center leading-relaxed">
          <strong className="text-[var(--color-text-dim)]">Disclaimer:</strong> allmovies does not host or store any media files.
          All content is embedded from third-party servers. We do not control, upload, or distribute any copyrighted material.
          For any copyright concerns, please contact the respective content providers/servers directly.
          allmovies is not responsible for the content provided by external sources.
        </div>
      </div>
    </footer>
  );
}
