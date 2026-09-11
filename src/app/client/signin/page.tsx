"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  LogIn,
  Mail,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { AuthLayout, AuthPerk } from "@/components/auth/AuthLayout";
import { authInputClass, authLabelClass } from "@/components/auth/AuthSection";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { clientSignIn, getLoggedInClient } from "@/lib/client-auth";

const clientPerks: AuthPerk[] = [
  {
    icon: ClipboardList,
    title: "All your briefs in one place",
    text: "See who accepted and who's still deciding.",
  },
  {
    icon: Zap,
    title: "Post a new brief anytime",
    text: "Matching creatives get alerted straight away.",
  },
  {
    icon: Users,
    title: "Book with confidence",
    text: "Compare accepted creatives, then book and pay securely.",
  },
];

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/client";
  return raw;
}

export default function ClientSignInPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNextPath(
      safeNextPath(new URLSearchParams(window.location.search).get("next"))
    );
  }, []);

  useEffect(() => {
    getLoggedInClient().then((client) => {
      if (client) router.replace(nextPath);
    });
  }, [router, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await clientSignIn(email.trim(), password);
      router.push(nextPath);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password."
      );
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Client Portal"
      title="Welcome back to UpNext"
      subtitle="Sign in to track your briefs, see which creatives accepted, and book the one you want."
      perks={clientPerks}
      footnote="Free to post a brief. You only pay when you book a creative."
    >
      <div className="mb-8 lg:hidden">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700">
          <Sparkles size={14} />
          Client Sign In
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-olive-900 sm:text-3xl">
          Welcome back
        </h1>
        <p className="mt-2 text-olive-600">Sign in to manage your briefs</p>
      </div>

      <div className="mb-8 hidden lg:block">
        <h1 className="text-3xl font-bold tracking-tight text-olive-900">
          Sign in
        </h1>
        <p className="mt-2 text-olive-600">
          Enter your credentials to access your briefs
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-olive-200/70 bg-milky-50 p-5 shadow-sm sm:p-8"
      >
        <div>
          <label htmlFor="email" className={authLabelClass}>
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400"
            />
            <input
              id="email"
              type="email"
              className={`${authInputClass} pl-10`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={authLabelClass}>
            Password
          </label>
          <PasswordInput
            id="password"
            showLockIcon
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3.5 font-semibold text-milky-50 shadow-sm transition-all hover:bg-olive-700 hover:shadow-md disabled:opacity-60"
        >
          <LogIn size={18} />
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-olive-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-milky-50 px-3 text-olive-500">New here?</span>
          </div>
        </div>

        <Link
          href="/client/register"
          className="flex w-full items-center justify-center rounded-xl border border-olive-200 bg-white py-3.5 text-sm font-semibold text-olive-700 transition-colors hover:bg-olive-50"
        >
          Create a client account
        </Link>

        <p className="text-center text-xs text-olive-500">
          Are you a creative?{" "}
          <Link href="/signin" className="font-medium text-olive-700 hover:underline">
            Sign in to the creator portal
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
