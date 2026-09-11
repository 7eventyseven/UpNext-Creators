"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { PwaInstallPrompt } from "./PwaInstallPrompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Grows to fill the viewport so the footer sits at the bottom of short pages. */}
      <main className="flex-1">{children}</main>
      <Footer />
      {!isHome && <PwaInstallPrompt />}
    </div>
  );
}
