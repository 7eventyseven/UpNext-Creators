"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Home,
  Calendar,
  Crown,
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  User,
  LogOut,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Logo } from "@/components/Logo";
import { creatorSignOut, getLoggedInCreator } from "@/lib/creator-auth";
import { Creator } from "@/types";
import { defaultSiteContent, SiteContent } from "@/lib/site-content";
import { fetchSiteContent } from "@/lib/site-content-client";
import { AppSettings, defaultAppSettings } from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    getLoggedInCreator().then((c) => setCreator(c ?? null));
    fetchSiteContent().then(setContent);
    fetchAppSettings().then(setSettings);
  }, [pathname]);

  const customerNav = useMemo(
    () => [
      { href: "/", label: content.header.navBrowse, icon: Home },
      { href: "/chat", label: content.header.navMessages, icon: MessageCircle },
      { href: "/bookings", label: content.header.navBookings, icon: Calendar },
    ],
    [content.header]
  );

  const creatorNav = useMemo(
    () =>
      creator
        ? [
            { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
            {
              href: `/creators/${creator.id}`,
              label: "My Profile",
              icon: User,
            },
            {
              href: "/chat",
              label: content.header.navMessages,
              icon: MessageCircle,
            },
            { href: "/subscribe", label: "Go Pro", icon: Crown },
          ]
        : [],
    [creator, content.header.navMessages]
  );

  const navItems = creator ? creatorNav : customerNav;
  const homeHref = creator ? "/dashboard" : "/";

  const handleSignOut = async () => {
    await creatorSignOut();
    setCreator(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-olive-200/60 bg-milky-100/90 backdrop-blur-md transition-shadow duration-300">
      {settings.maintenanceMode && !creator && (
        <div className="bg-amber-500 px-4 py-2 text-center text-xs sm:text-sm font-medium text-olive-950">
          Maintenance mode — creator sign in and registration are temporarily
          unavailable.
        </div>
      )}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={homeHref} className="flex shrink-0 items-center">
          <Logo
            size="md"
            variant="full"
            primary={content.brand.logoPrimary}
            secondary={content.brand.logoSecondary}
          />
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
          {creator ? (
            <>
              <div className="hidden sm:flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={creator.avatar}
                  alt=""
                  className="h-8 w-8 rounded-full object-cover border border-olive-200"
                />
                <span className="text-sm font-medium text-olive-700 max-w-[100px] truncate">
                  {creator.name.split(" ")[0]}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-2 text-sm font-medium text-olive-600 hover:bg-olive-100"
                aria-label={content.header.signOutLabel}
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">{content.header.signOutLabel}</span>
              </button>
            </>
          ) : settings.maintenanceMode ? (
            <span className="hidden sm:inline text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Auth paused
            </span>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-olive-700 hover:bg-olive-100 transition-all duration-200 hover:-translate-y-0.5"
              >
                <LogIn size={16} />
                {content.header.signInLabel}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-xl bg-olive-600 px-3.5 py-2 text-sm font-semibold text-milky-50 hover:bg-olive-700 btn-lift"
              >
                <UserPlus size={16} />
                {content.header.registerLabel}
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

          <div className="border-t border-olive-200/60 pt-2 mt-2 space-y-1">
            {creator ? (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-100"
              >
                <LogOut size={18} />
                {content.header.signOutLabel}
              </button>
            ) : settings.maintenanceMode ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
                Sign in and registration are paused during maintenance.
              </p>
            ) : (
              <>
                <Link
                  href="/signin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-100"
                >
                  <LogIn size={18} />
                  {content.header.signInLabel}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium bg-olive-600 text-milky-50"
                >
                  <UserPlus size={18} />
                  {content.header.registerLabel}
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
