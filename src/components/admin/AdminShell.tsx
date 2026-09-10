"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { adminLogout } from "@/lib/admin-auth";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/admin/login";
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await adminLogout();
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <AdminGuard>{children}</AdminGuard>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-milky-100">
        <div className="hidden lg:flex">
          <AdminSidebar />
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-olive-950/50"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-10 h-full w-[min(100%,18rem)] shadow-xl">
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-olive-200 bg-milky-50/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-olive-700 hover:bg-olive-100"
                aria-label="Open admin menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <div className="min-w-0">
                <p className="truncate font-semibold text-olive-900">
                  UpNext Admin
                </p>
                <p className="text-xs text-olive-500">Manage your marketplace</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-olive-200 px-3 py-2 text-sm font-medium text-olive-700 hover:bg-olive-100"
            >
              <LogOut size={16} />
              Log Out
            </button>
          </header>
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </AdminGuard>
  );
}
