"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Calendar,
  Crown,
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  User,
  Inbox,
  FileText,
  Compass,
  Home,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Logo } from "@/components/Logo";
import { creatorSignOut, getLoggedInCreator } from "@/lib/creator-auth";
import {
  clearAppRole,
  clearClient,
  getAppRole,
  getClient,
} from "@/lib/client-auth";
import { Creator } from "@/types";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    void getLoggedInCreator().then((c) => setCreator(c ?? null));
    setIsClient(getAppRole() === "client" && Boolean(getClient()));
  }, [pathname]);

  const navItems = useMemo(() => {
    if (creator) {
      return [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/briefs", label: "Briefs", icon: Inbox },
        { href: `/creators/${creator.id}`, label: "Profile", icon: User },
        { href: "/subscribe", label: "Go Pro", icon: Crown },
      ];
    }
    if (isClient) {
      return [
        { href: "/client", label: "My Briefs", icon: FileText },
        { href: "/brief", label: "New Brief", icon: Home },
        { href: "/explore", label: "Explore", icon: Compass },
        { href: "/bookings", label: "Bookings", icon: Calendar },
      ];
    }
    return [
      { href: "/", label: "Home", icon: Home },
      { href: "/explore", label: "Explore", icon: Compass },
      { href: "/brief", label: "Start brief", icon: FileText },
    ];
  }, [creator, isClient]);

  const homeHref = creator ? "/dashboard" : isClient ? "/client" : "/";

  const handleSignOut = () => {
    if (creator) {
      creatorSignOut();
      setCreator(null);
    }
    clearClient();
    clearAppRole();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-olive-200/60 bg-milky-100/90 backdrop-blur-md transition-shadow duration-300">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={homeHref} className="flex shrink-0 items-center">
          <Logo size="md" variant="full" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-olive-600 text-milky-50"
                    : "text-olive-700 hover:bg-olive-100 hover:text-olive-800"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {creator || isClient ? (
            <div className="hidden sm:flex items-center gap-2">
              {creator && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={creator.avatar}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover border border-olive-200"
                  />
                  <span className="text-sm font-medium text-olive-700 max-w-[100px] truncate">
                    {creator.name.split(" ")[0]}
                  </span>
                </>
              )}
              {isClient && !creator && (
                <span className="text-sm font-medium text-olive-700">
                  {getClient()?.name.split(" ")[0]}
                </span>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg px-3 py-2 text-sm font-medium text-olive-600 hover:bg-olive-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-olive-700 hover:bg-olive-100"
              >
                <LogIn size={16} />
                Creative sign in
              </Link>
              <Link
                href="/brief"
                className="inline-flex items-center gap-1.5 rounded-xl bg-olive-600 px-3.5 py-2 text-sm font-semibold text-milky-50 hover:bg-olive-700 btn-lift"
              >
                <UserPlus size={16} />
                Need a creative
              </Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-olive-700 hover:bg-olive-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-olive-200/60 bg-milky-100 px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active
                    ? "bg-olive-600 text-milky-50"
                    : "text-olive-700 hover:bg-olive-100"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
          <div className="border-t border-olive-200/60 pt-2 mt-2">
            {creator || isClient ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-100"
              >
                Sign Out
              </button>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-100"
                >
                  Creative sign in
                </Link>
                <Link
                  href="/brief"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-olive-600 text-milky-50"
                >
                  Need a creative
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
