"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Mail, Phone, User } from "lucide-react";
import { authInputClass } from "@/components/auth/AuthSection";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { getLoggedInClient, registerClient } from "@/lib/client-auth";
import { CLIENT_FLOW_STEPS } from "@/lib/client-flow";

const labelClass = "mb-1.5 block text-sm font-medium text-olive-700";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/brief?new=1";
  return raw;
}

export default function ClientRegisterPage() {
  const router = useRouter();
  const [nextPath, setNextPath] = useState("/brief?new=1");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const canSubmit =
    Boolean(name.trim() && email.trim() && phone.trim()) &&
    password.length >= 6 &&
    confirmPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerClient({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
      });
      router.push(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-8 sm:py-12">
      <Link
        href="/get-started"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-olive-600 hover:text-olive-800"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-olive-500">
          Step 1 of {CLIENT_FLOW_STEPS.length} · {CLIENT_FLOW_STEPS[0]}
        </p>
        <div className="flex gap-2">
          {CLIENT_FLOW_STEPS.map((label, i) => (
            <div
              key={label}
              className={`h-1.5 flex-1 rounded-full ${
                i === 0 ? "bg-olive-600" : "bg-olive-200"
              }`}
            />
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-olive-200/70 bg-milky-50 p-6 shadow-sm"
      >
        <div>
          <h1 className="text-2xl font-bold text-olive-900">
            First, who are you?
          </h1>
          <p className="mt-1 text-sm text-olive-600">
            We need this so creatives can reach you about the job.
          </p>
        </div>

        <div>
          <label htmlFor="name" className={labelClass}>
            Your name
          </label>
          <div className="relative">
            <User
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400"
            />
            <input
              id="name"
              className={`${authInputClass} pl-10`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ada Okafor"
              autoComplete="name"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
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
          <p className="mt-1.5 text-xs text-olive-500">
            You&apos;ll use this to log back in and check your bookings.
          </p>
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            WhatsApp number
          </label>
          <div className="relative">
            <Phone
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400"
            />
            <input
              id="phone"
              className={`${authInputClass} pl-10`}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="2348012345678"
              autoComplete="tel"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className={labelClass}>
              Confirm password
            </label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              autoComplete="new-password"
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
          disabled={loading || !canSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3.5 font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-50"
        >
          {loading ? "Creating your account..." : "Continue to your brief"}
          {!loading && <ArrowRight size={18} />}
        </button>

        <p className="text-center text-sm text-olive-600">
          Already have an account?{" "}
          <Link
            href="/client/signin"
            className="font-semibold text-olive-700 underline-offset-2 hover:text-olive-900 hover:underline"
          >
            Log in
          </Link>
        </p>
      </form>

      <p className="mt-6 text-center text-xs text-olive-500">
        Are you a creative?{" "}
        <Link href="/register" className="font-medium text-olive-700 hover:underline">
          Join as a creative instead
        </Link>
      </p>
    </div>
  );
}
