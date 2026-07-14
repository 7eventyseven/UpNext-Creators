"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Calendar, Crown, Tags, TrendingUp, Clock } from "lucide-react";
import { getAllCreators } from "@/data/creators";
import { getBookings } from "@/lib/storage";
import { getCategories } from "@/lib/categories";
import { formatPrice } from "@/data/creators";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    creators: 0,
    subscribed: 0,
    bookings: 0,
    pending: 0,
    categories: 0,
    revenue: 0,
  });

  useEffect(() => {
    const creators = getAllCreators();
    const bookings = getBookings();
    const subscribed = creators.filter((c) => c.isSubscribed).length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const revenue = bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.price, 0);

    setStats({
      creators: creators.length,
      subscribed,
      bookings: bookings.length,
      pending,
      categories: getCategories().length,
      revenue,
    });
  }, []);

  const cards = [
    {
      label: "Total Creators",
      value: stats.creators,
      icon: Users,
      href: "/admin/creators",
      color: "bg-olive-100 text-olive-700",
    },
    {
      label: "Subscribed",
      value: stats.subscribed,
      icon: Crown,
      href: "/admin/subscriptions",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Total Bookings",
      value: stats.bookings,
      icon: Calendar,
      href: "/admin/bookings",
      color: "bg-olive-100 text-olive-700",
    },
    {
      label: "Pending Bookings",
      value: stats.pending,
      icon: Clock,
      href: "/admin/bookings",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Categories",
      value: stats.categories,
      icon: Tags,
      href: "/admin/categories",
      color: "bg-olive-100 text-olive-700",
    },
    {
      label: "Booking Revenue",
      value: formatPrice(stats.revenue),
      icon: TrendingUp,
      href: "/admin/bookings",
      color: "bg-olive-100 text-olive-700",
      isText: true,
    },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-olive-900">Dashboard</h1>
        <p className="text-olive-600">Overview of platform operations</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href, color, isText }) => (
          <Link
            key={label}
            href={href}
            className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-olive-600">{label}</p>
                <p
                  className={`mt-1 font-bold text-olive-900 ${isText ? "text-xl" : "text-3xl"}`}
                >
                  {value}
                </p>
              </div>
              <div className={`rounded-xl p-2.5 ${color}`}>
                <Icon size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-olive-200/70 bg-milky-50 p-6">
        <h2 className="font-semibold text-olive-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/creators?new=1"
            className="rounded-xl bg-olive-600 px-4 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
          >
            Add Creator
          </Link>
          <Link
            href="/admin/bookings"
            className="rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-semibold text-olive-700 hover:bg-olive-50"
          >
            Review Bookings
          </Link>
          <Link
            href="/admin/categories"
            className="rounded-xl border border-olive-200 px-4 py-2.5 text-sm font-semibold text-olive-700 hover:bg-olive-50"
          >
            Manage Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
