"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Shield } from "lucide-react";
import { adminLogin } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (adminLogin(password)) {
      router.replace("/admin");
    } else {
      setError("Incorrect password. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-olive-900 via-olive-800 to-olive-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-olive-700/50 bg-milky-50 p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-olive-600 text-milky-50">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold text-olive-900">Admin Login</h1>
          <p className="mt-1 text-sm text-olive-600">
            Sign in to manage UpNext Creators
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-olive-700"
            >
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-olive-200 bg-milky-50 py-3 pl-10 pr-4 text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-olive-600 py-3 font-semibold text-milky-50 transition-colors hover:bg-olive-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-olive-500">
          Default password: <code className="text-olive-700">upnext2024</code>
        </p>
      </div>
    </div>
  );
}
