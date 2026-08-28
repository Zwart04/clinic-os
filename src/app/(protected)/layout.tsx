"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useApp } from "@/lib/app-context";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { mounted, user } = useApp();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [mounted, user, router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
