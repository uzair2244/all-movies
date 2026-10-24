"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light";

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem("wf-theme") as Theme) || "dark";
    setThemeState(stored);
    document.documentElement.setAttribute("data-theme", stored);
    setMounted(true);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("wf-theme", t);
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  // avoid flash: render children after mount but keep SSR markup
  if (!mounted) {
    return (
      <Ctx.Provider value={{ theme: "dark", toggle, setTheme }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </Ctx.Provider>
    );
  }

  return <Ctx.Provider value={{ theme, toggle, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
