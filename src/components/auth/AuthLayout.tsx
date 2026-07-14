"use client";

import Link from "next/link";
import { ArrowLeft, Camera, TrendingUp, Users } from "lucide-react";

const perks = [
  {
    icon: Users,
    title: "Get discovered nationwide",
    text: "Show up in search across every state in Nigeria.",
  },
  {
    icon: Camera,
    title: "Showcase your best work",
    text: "Upload profile photos and top-grossing videos.",
  },
  {
    icon: TrendingUp,
    title: "Land more bookings",
    text: "Rank higher, connect with clients, and grow your brand.",
  },
];

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
}

export function AuthLayout({ children, title, subtitle, badge }: AuthLayoutProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] lg:grid lg:grid-cols-2">
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-olive-700 via-olive-800 to-olive-950 p-10 text-milky-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-milky-100 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-olive-400 blur-3xl" />
        </div>

        <div className="relative">
          <Link href="/" className="inline-block">
            <p className="text-2xl font-bold tracking-tight text-milky-50">UpNext</p>
            <p className="text-[10px] font-medium tracking-[0.18em] text-olive-300 uppercase">
              Creators
            </p>
          </Link>
        </div>

        <div className="relative space-y-8">
          {badge && (
            <span className="inline-block rounded-full bg-milky-50/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              {badge}
            </span>
          )}
          <div>
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              {title}
            </h2>
            <p className="mt-3 text-olive-100/90 text-lg leading-relaxed max-w-md">
              {subtitle}
            </p>
          </div>

          <ul className="space-y-5">
            {perks.map(({ icon: Icon, title: perkTitle, text }) => (
              <li key={perkTitle} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-milky-50/15 backdrop-blur-sm">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold">{perkTitle}</p>
                  <p className="text-sm text-olive-100/80 mt-0.5">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-olive-200/70">
          Nigeria&apos;s creator marketplace — built for photographers, musicians,
          designers, and more.
        </p>
      </aside>

      <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-olive-600 hover:text-olive-800 w-fit"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="mx-auto w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
}
