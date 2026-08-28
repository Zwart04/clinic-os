"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Stethoscope, ListOrdered, CalendarCheck,
  Pill, Wallet, BarChart3, MessageCircle, Settings as SettingsIcon,
  Globe, Moon, Sun, LogOut, ExternalLink
} from "lucide-react";
import { useApp } from "@/lib/app-context";
import { t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: keyof typeof import("@/lib/i18n").dict;
  icon: React.ComponentType<{ className?: string }>;
  group: "main" | "tools";
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "dashboard", icon: LayoutDashboard, group: "main" },
  { href: "/patients", label: "patients", icon: Users, group: "main" },
  { href: "/visits", label: "visits", icon: Stethoscope, group: "main" },
  { href: "/queue", label: "queue", icon: ListOrdered, group: "main" },
  { href: "/appointments", label: "appointments", icon: CalendarCheck, group: "main" },
  { href: "/pharmacy", label: "pharmacy", icon: Pill, group: "tools" },
  { href: "/finance", label: "finance", icon: Wallet, group: "tools" },
  { href: "/analytics", label: "analytics", icon: BarChart3, group: "tools" },
  { href: "/waha", label: "waha", icon: MessageCircle, group: "tools" },
  { href: "/settings", label: "settings", icon: SettingsIcon, group: "tools" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, theme, toggleLang, toggleTheme, setUser, user, mounted } = useApp();

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        {t("loading", lang)}
      </div>
    );
  }

  const handleLogout = () => {
    setUser(null);
    router.push("/login");
  };

  const main = NAV.filter((n) => n.group === "main");
  const tools = NAV.filter((n) => n.group === "tools");

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card">
        <div className="p-4 border-b">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">C+</div>
            <div>
              <div className="font-semibold text-sm">{t("appName", lang)}</div>
              <div className="text-[10px] text-muted-foreground leading-tight">{t("tagline", lang)}</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1">Main</div>
          {main.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {t(item.label, lang)}
              </Link>
            );
          })}

          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-3 py-1 mt-3">Tools</div>
          {tools.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                {t(item.label, lang)}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t space-y-2">
          <Link
            href="/c/klinik-sehat"
            target="_blank"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-xs hover:bg-muted"
          >
            <ExternalLink className="w-3 h-3" />
            {t("publicPage", lang)}
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={toggleLang} className="btn btn-ghost text-xs flex-1" title="Toggle language">
              <Globe className="w-3 h-3" /> {lang.toUpperCase()}
            </button>
            <button onClick={toggleTheme} className="btn btn-ghost text-xs flex-1" title="Toggle theme">
              {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
          {user && (
            <div className="text-[10px] text-muted-foreground px-3">
              <div className="truncate">{user.email}</div>
              <div className="truncate">{user.clinicName}</div>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-ghost text-xs w-full justify-start">
            <LogOut className="w-3 h-3" /> {t("logout", lang)}
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between p-3 border-b bg-card sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">C+</div>
            <span className="font-semibold text-sm">{t("appName", lang)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleLang} className="btn btn-ghost text-xs px-2"><Globe className="w-3 h-3" />{lang.toUpperCase()}</button>
            <button onClick={toggleTheme} className="btn btn-ghost text-xs px-2">
              {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </button>
          </div>
        </header>

        {/* Mobile nav scroll */}
        <nav className="md:hidden flex overflow-x-auto gap-1 p-2 border-b bg-card sticky top-12 z-10">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-[10px] whitespace-nowrap",
                  active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(item.label, lang)}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          <div className="max-w-7xl mx-auto fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
