"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAdminLoggedIn } from "@/lib/admin-auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    const loggedIn = isAdminLoggedIn();

    if (!loggedIn && !isLoginPage) {
      router.replace("/admin/login");
    } else if (loggedIn && isLoginPage) {
      router.replace("/admin");
    } else {
      setReady(true);
    }
  }, [pathname, router, isLoginPage]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-olive-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-milky-100" />
      </div>
    );
  }

  return <>{children}</>;
}
