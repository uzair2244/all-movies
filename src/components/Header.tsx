"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, Film, Home, Search as SearchIcon, Library } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import SearchBar from "./SearchBar";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Hollywood", href: "/hollywood" },
  { label: "Bollywood", href: "/category/bollywood-movies" },
  { label: "Hindi Dubbed", href: "/category/hindi-dubbed-movies" },
  { label: "Punjabi", href: "/category/punjabi-movies" },
  { label: "Web Series", href: "/category/seasons-webseries" },
];

export default function Header() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--color-bg)]/85 backdrop-blur-xl border-b border-[var(--color-border)]"
            : "bg-[var(--color-bg)]/60 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4 h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-deep)] text-white shadow-lg shadow-[var(--color-accent-glow)] group-hover:scale-105 transition-transform">
              <Film size={18} />
            </span>
            <span className="font-display font-extrabold text-xl tracking-tight hidden sm:block">
              all<span className="text-[var(--color-accent)]">movies</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-[var(--color-text)] bg-[var(--color-bg-card)]"
                    : "text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)]/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 flex-1 justify-end max-w-md">
            <SearchBar variant="header" />
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)] transition-colors shrink-0"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--color-text-dim)] hover:text-[var(--color-text)] shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-[var(--color-bg-elev)] border-l border-[var(--color-border-strong)] p-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-display font-extrabold text-lg">
                all<span className="text-[var(--color-accent)]">movies</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-card)]"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <SearchBar variant="header" />
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "text-[var(--color-text)] bg-[var(--color-bg-card)]"
                      : "text-[var(--color-text-dim)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-card)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-[var(--color-border)] space-y-3">
              <button onClick={toggle} className="btn btn-ghost w-full">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-[var(--color-border)] safe-bottom">
        <div className="flex items-center justify-around h-16">
          {[
            { icon: Home, label: "Home", href: "/" },
            { icon: SearchIcon, label: "Search", href: "/search" },
            { icon: Library, label: "Browse", href: "/category/bollywood-movies" },
            { icon: Film, label: "Hollywood", href: "/hollywood" },
          ].map(({ icon: Icon, label, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  active ? "text-[var(--color-accent)]" : "text-[var(--color-text-faint)]"
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
