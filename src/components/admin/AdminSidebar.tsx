"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Crown,
  Tags,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { adminLogout } from "@/lib/admin-auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/creators", label: "Creators", icon: Users },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: Crown },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    adminLogout();
    router.push("/admin/login");
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-olive-800 bg-olive-900 text-milky-100">
      <div className="border-b border-olive-800 px-5 py-5">
        <p className="text-lg font-bold tracking-tight text-milky-50">UpNext</p>
        <p className="text-[10px] font-medium tracking-[0.18em] text-olive-400 uppercase">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-olive-700 text-milky-50"
                  : "text-olive-200 hover:bg-olive-800 hover:text-milky-50"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-olive-800 px-3 py-4 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-olive-300 hover:bg-olive-800 hover:text-milky-50"
        >
          <ExternalLink size={18} />
          View Site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-olive-300 hover:bg-olive-800 hover:text-red-300"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </aside>
  );
}
