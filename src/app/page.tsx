"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, UserRound, Clapperboard } from "lucide-react";
import { AnimatedHeadline } from "@/components/AnimatedHeadline";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { getAppRole, getClient, setAppRole } from "@/lib/client-auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      const creator = await getLoggedInCreator();
      if (creator) {
        router.replace("/dashboard");
        return;
      }
      const role = getAppRole();
      if (role === "client" && getClient()) {
        router.replace("/client");
      }
    })();
  }, [router]);

  const chooseClient = () => {
    setAppRole("client");
    router.push("/brief");
  };

  const chooseCreative = () => {
    setAppRole("creator");
    router.push("/signin");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-16">
      <section className="relative text-center mb-12 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-olive-200/40 blur-3xl animate-float-slow"
        />

        <div
          className="relative inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700 mb-5 opacity-0 animate-slide-up"
          style={{ animationDelay: "60ms" }}
        >
          <Sparkles size={14} className="animate-sparkle" />
          Matched, not hunted
        </div>

        <div className="relative">
          <AnimatedHeadline
            words={[
              { text: "Tell" },
              { text: "us" },
              { text: "the" },
              { text: "vision." },
            ]}
          />
          <p
            className="mt-3 text-2xl sm:text-3xl font-bold text-olive-700 opacity-0 animate-slide-up"
            style={{ animationDelay: "480ms" }}
          >
            We&apos;ll find the talent.
          </p>
        </div>

        <p
          className="relative mt-5 text-olive-600 max-w-xl mx-auto leading-relaxed opacity-0 animate-slide-up"
          style={{ animationDelay: "620ms" }}
        >
          UpNext is not a feed. Share what you need — we alert the right creatives.
          They accept. You book. Less scrolling. More creating.
        </p>
      </section>

      <section
        className="grid gap-4 sm:grid-cols-2 opacity-0 animate-slide-up"
        style={{ animationDelay: "750ms" }}
      >
        <button
          type="button"
          onClick={chooseClient}
          className="group text-left rounded-2xl border border-olive-200/80 bg-milky-50 p-6 sm:p-8 shadow-sm transition-all hover:border-olive-400 hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-olive-100 text-olive-700">
            <UserRound size={24} />
          </div>
          <h2 className="text-xl font-bold text-olive-900">I need a creative</h2>
          <p className="mt-2 text-sm text-olive-600 leading-relaxed">
            Answer a few questions. We&apos;ll match you with creatives who fit your
            brief, budget, and location.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-olive-700 group-hover:gap-3 transition-all">
            Start your brief
            <ArrowRight size={16} />
          </span>
        </button>

        <button
          type="button"
          onClick={chooseCreative}
          className="group text-left rounded-2xl border border-olive-200/80 bg-gradient-to-br from-olive-700 to-olive-900 p-6 sm:p-8 text-milky-50 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-milky-50/15">
            <Clapperboard size={24} />
          </div>
          <h2 className="text-xl font-bold">I am a creative</h2>
          <p className="mt-2 text-sm text-olive-100/90 leading-relaxed">
            Get qualified briefs from clients who already know what they want.
            Accept or decline — your call.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-milky-50 group-hover:gap-3 transition-all">
            Creative sign in
            <ArrowRight size={16} />
          </span>
        </button>
      </section>

      <p
        className="mt-8 text-center text-sm text-olive-500 opacity-0 animate-slide-up"
        style={{ animationDelay: "900ms" }}
      >
        Prefer to look around first?{" "}
        <Link href="/explore" className="font-semibold text-olive-700 hover:underline">
          Explore creatives
        </Link>
      </p>

      <footer className="mt-16 border-t border-olive-200/60 pt-6 text-center">
        <Link
          href="/admin"
          className="text-xs font-medium text-olive-400 hover:text-olive-600 transition-colors"
        >
          Admin Panel
        </Link>
      </footer>
    </div>
  );
}
