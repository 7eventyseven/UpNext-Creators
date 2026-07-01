"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Home, Calendar, Crown, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Creators", icon: Home },
  { href: "/chat", label: "Messages", icon: MessageCircle },
  { href: "/bookings", label: "Bookings", icon: Calendar },
  { href: "/subscribe", label: "Go Pro", icon: Crown },
];

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-olive-200/60 bg-milky-100/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-olive-600 text-milky-50 font-bold text-sm shadow-sm">
            UN
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold text-olive-800 text-lg tracking-tight">
              UpNext
            </span>
            <span className="ml-1 text-olive-500 text-sm font-medium">Creators</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
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

        <button
          type="button"
          className="md:hidden rounded-lg p-2 text-olive-700 hover:bg-olive-100"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-olive-200/60 bg-milky-100 px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
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
        </nav>
      )}
    </header>
  );
}
