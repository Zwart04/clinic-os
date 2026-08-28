"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { Lang } from "./i18n";

export type Theme = "light" | "dark";

interface AppState {
  lang: Lang;
  theme: Theme;
  user: { email: string; name: string; clinicName: string; clinicSlug: string } | null;
  setLang: (l: Lang) => void;
  setTheme: (t: Theme) => void;
  setUser: (u: AppState["user"]) => void;
  toggleLang: () => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const Ctx = createContext<AppState | null>(null);

const DEFAULT_USER: AppState["user"] = {
  email: "demo@clinic-os.local",
  name: "Dr. Demo",
  clinicName: "Klinik Sehat Sentosa",
  clinicSlug: "klinik-sehat",
};

export function getStoredUsers(): { email: string; password: string; name: string; clinicName: string; clinicSlug: string }[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("co_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("id");
  const [theme, setThemeState] = useState<Theme>("light");
  const [user, setUserState] = useState<AppState["user"] | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedLang = window.localStorage.getItem("co_lang") as Lang | null;
      const savedTheme = window.localStorage.getItem("co_theme") as Theme | null;
      const savedUser = window.localStorage.getItem("co_user");
      if (savedLang === "id" || savedLang === "en") setLangState(savedLang);
      if (savedTheme === "light" || savedTheme === "dark") setThemeState(savedTheme);
      if (savedUser) {
        try {
          setUserState(JSON.parse(savedUser));
        } catch {
          setUserState(DEFAULT_USER);
        }
      } else {
        setUserState(DEFAULT_USER);
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme, mounted]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem("co_lang", l);
  }, []);

  const setTheme = useCallback((th: Theme) => {
    setThemeState(th);
    if (typeof window !== "undefined") window.localStorage.setItem("co_theme", th);
  }, []);

  const setUser = useCallback((u: AppState["user"]) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) window.localStorage.setItem("co_user", JSON.stringify(u));
      else window.localStorage.removeItem("co_user");
    }
  }, []);

  const toggleLang = useCallback(() => setLang(lang === "id" ? "en" : "id"), [lang, setLang]);
  const toggleTheme = useCallback(() => setTheme(theme === "light" ? "dark" : "light"), [theme, setTheme]);

  return (
    <Ctx.Provider value={{ lang, theme, user, setLang, setTheme, setUser, toggleLang, toggleTheme, mounted }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used inside AppProvider");
  return v;
}
