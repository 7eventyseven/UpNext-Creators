"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Sparkles } from "lucide-react";
import { creatorSignIn, getLoggedInCreator } from "@/lib/creator-auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { authInputClass, authLabelClass } from "@/components/auth/AuthSection";
import { MaintenanceNotice } from "@/components/MaintenanceNotice";
import { AppSettings, defaultAppSettings } from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  useEffect(() => {
    fetchAppSettings().then(setSettings);
    getLoggedInCreator().then((creator) => {
      if (creator) router.replace("/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const creator = await creatorSignIn(email.trim(), password);
      if (creator) {
        router.push("/dashboard");
        return;
      }
      setError("Invalid email or password. Please try again.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const blocked = settings.maintenanceMode;

  return (
    <AuthLayout
      badge="Creator Portal"
      title="Welcome back to UpNext"
      subtitle="Sign in to manage your profile, update your showcase, and track your presence on Nigeria's creator marketplace."
    >
      <div className="mb-8 lg:hidden">
        <div className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700 mb-4">
          <Sparkles size={14} />
          Creator Sign In
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-olive-900 tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-olive-600">
          Sign in to manage your creator profile
        </p>
      </div>

      <div className="hidden lg:block mb-8">
        <h1 className="text-3xl font-bold text-olive-900 tracking-tight">
          Sign in
        </h1>
        <p className="mt-2 text-olive-600">
          Enter your credentials to access your dashboard
        </p>
      </div>

      <MaintenanceNotice settings={settings} />

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-olive-200/70 bg-milky-50 p-5 sm:p-8 shadow-sm"
      >
        <div>
          <label htmlFor="email" className={authLabelClass}>
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400"
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
              disabled={blocked}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={authLabelClass}>
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400"
            />
            <input
              id="password"
              type="password"
              className={`${authInputClass} pl-10`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={blocked}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || blocked}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3.5 font-semibold text-milky-50 shadow-sm hover:bg-olive-700 hover:shadow-md transition-all disabled:opacity-60"
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
          href="/register"
          className="flex w-full items-center justify-center rounded-xl border border-olive-200 bg-white py-3.5 text-sm font-semibold text-olive-700 hover:bg-olive-50 transition-colors"
        >
          Create a creator account
        </Link>
      </form>
    </AuthLayout>
  );
}
