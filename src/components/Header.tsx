"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Crown,
  Menu,
  X,
  LayoutDashboard,
  User,
  Inbox,
  FileText,
  Compass,
  Home,
  LogOut,
  Search,
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
import { defaultSiteContent, SiteContent } from "@/lib/site-content";
import { fetchSiteContent } from "@/lib/site-content-client";
import { AppSettings, defaultAppSettings } from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";

const marketingNav = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/businesses", label: "For Businesses" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    getLoggedInCreator().then((c) => setCreator(c ?? null));
    setIsClient(getAppRole() === "client" && Boolean(getClient()));
    fetchSiteContent().then(setContent);
    fetchAppSettings().then(setSettings);
  }, [pathname]);

  const appNavItems = useMemo(() => {
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
    return [];
  }, [creator, isClient]);

  const isAppUser = Boolean(creator || isClient);
  const homeHref = creator ? "/dashboard" : isClient ? "/client" : "/";

  const handleSignOut = async () => {
    if (creator) {
      await creatorSignOut();
      setCreator(null);
    }
    clearClient();
    clearAppRole();
    window.location.href = "/";
  };

  const marketingActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 bg-milky-100">
      {settings.maintenanceMode && !creator && (
        <div className="bg-amber-500 px-4 py-2 text-center text-xs sm:text-sm font-medium text-olive-950">
          Maintenance mode — creator sign in and registration are temporarily
          unavailable.
        </div>
      )}
      <div
        className={`mx-auto h-[4.75rem] max-w-[1280px] items-center gap-4 px-5 sm:px-8 lg:px-10 ${
          isAppUser
            ? "flex justify-between"
            : "flex justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]"
        }`}
      >
        <Link href={homeHref} className="flex shrink-0 items-center">
          <Logo
            size="md"
            variant="full"
            primary={content.brand.logoPrimary}
            secondary={content.brand.logoSecondary}
          />
        </Link>

        {isAppUser ? (
          <nav className="hidden md:flex items-center gap-1">
            {appNavItems.map(({ href, label, icon: Icon }) => {
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
        ) : (
          <nav className="hidden lg:flex items-center gap-0.5">
            {marketingNav.map(({ href, label }) => {
              const active = marketingActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors ${
                    active
                      ? "bg-[#2f3a1c] text-milky-50"
                      : "text-olive-800/80 hover:text-olive-900 hover:bg-olive-50"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}

        <div className={`flex items-center gap-2 ${isAppUser ? "" : "lg:justify-self-end"}`}>
          {isAppUser ? (
            <>
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
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/explore"
                aria-label="Search creatives"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-olive-200/80 bg-white text-olive-800 hover:bg-olive-50"
              >
                <Search size={16} />
              </Link>
              <Link
                href="/signin"
                className="rounded-full border border-olive-200/80 bg-white px-5 py-2 text-[13.5px] font-medium text-olive-900 hover:bg-olive-50"
              >
                Log in
              </Link>
              <Link
                href="/#start"
                className="rounded-full bg-[#2f3a1c] px-5 py-2 text-[13.5px] font-semibold text-milky-50 hover:bg-olive-800"
              >
                Get started
              </Link>
            </div>
          )}

          <button
            type="button"
            className={`${isAppUser ? "md:hidden" : "lg:hidden"} rounded-lg p-2 text-olive-700 hover:bg-olive-100`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className={`${isAppUser ? "md:hidden" : "lg:hidden"} border-t border-olive-200/60 bg-milky-100 px-4 py-3 space-y-1`}>
          {isAppUser
            ? appNavItems.map(({ href, label, icon: Icon }) => {
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
              })
            : marketingNav.map(({ href, label }) => {
                const active = marketingActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium ${
                      active
                        ? "bg-[#2f3a1c] text-milky-50"
                        : "text-olive-700 hover:bg-olive-100"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
          <div className="border-t border-olive-200/60 pt-2 mt-2">
            {isAppUser ? (
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
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-olive-700 hover:bg-olive-100"
                >
                  Log in
                </Link>
                <Link
                  href="/#start"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium bg-[#2f3a1c] text-milky-50"
                >
                  Get started
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
