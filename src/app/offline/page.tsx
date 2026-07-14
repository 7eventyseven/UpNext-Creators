"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-olive-200/70 bg-milky-50/90 p-8 text-center shadow-xl backdrop-blur-md">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-olive-100 text-olive-700">
          <WifiOff size={28} aria-hidden />
        </div>
        <h1 className="text-2xl font-bold text-olive-900">You&apos;re offline</h1>
        <p className="mt-2 text-olive-600 leading-relaxed">
          UpNext Creators can&apos;t reach the network right now. Check your
          connection and try again — cached pages may still work.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-olive-600 px-5 py-3 text-sm font-semibold text-milky-50 hover:bg-olive-700"
          >
            <RefreshCw size={16} />
            Retry
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-olive-200 px-5 py-3 text-sm font-semibold text-olive-700 hover:bg-olive-50"
          >
            <Home size={16} />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
