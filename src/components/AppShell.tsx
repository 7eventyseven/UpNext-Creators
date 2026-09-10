"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { PwaInstallPrompt } from "./PwaInstallPrompt";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      <PwaInstallPrompt />
    </>
  );
}
