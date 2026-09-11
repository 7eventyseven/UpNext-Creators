"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Search, UserRound } from "lucide-react";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { getLoggedInClient, setAppRole } from "@/lib/client-auth";

const roles = [
  {
    id: "client" as const,
    href: "/client/register",
    icon: Search,
    title: "I need a creative",
    blurb:
      "Create a free account, tell us about the job, and we'll match you with creatives who fit.",
    steps: ["Create account", "Fill a brief", "Get matched & book"],
    tone: "light" as const,
    signInHref: "/client/signin",
  },
  {
    id: "creator" as const,
    href: "/register",
    icon: UserRound,
    title: "I am a creative",
    blurb:
      "Set up your profile with your work and pricing, then get qualified briefs from real clients.",
    steps: ["Create account", "Add work & pricing", "Receive briefs"],
    tone: "dark" as const,
    signInHref: "/signin",
  },
];

export default function GetStartedPage() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      const creator = await getLoggedInCreator();
      if (creator) {
        router.replace("/dashboard");
        return;
      }
      const client = await getLoggedInClient();
      if (client) router.replace("/client");
    })();
  }, [router]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-olive-600 hover:text-olive-800"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <div className="mb-8 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-olive-500">
          Get started
        </p>
        <h1 className="mt-3 font-serif text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-[#1c2414] sm:text-[2.5rem]">
          How do you want to use UpNext?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-olive-700/85">
          Pick one to open the right registration form. You can always switch
          later.
        </p>
      </div>

      <div className="grid gap-4">
        {roles.map(({ id, href, icon: Icon, title, blurb, steps, tone, signInHref }) => {
          const dark = tone === "dark";
          return (
            <div
              key={id}
              className={`rounded-[1.75rem] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 sm:p-6 ${
                dark
                  ? "bg-[#2f3a1c] text-milky-50 shadow-[0_12px_40px_rgba(47,58,28,0.18)] hover:shadow-[0_20px_55px_rgba(47,58,28,0.28)]"
                  : "border border-olive-100 bg-white shadow-[0_10px_40px_rgba(47,58,28,0.06)] hover:shadow-[0_18px_50px_rgba(47,58,28,0.12)]"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setAppRole(id);
                  router.push(href);
                }}
                className="flex w-full items-center gap-4 text-left"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                    dark ? "bg-white/10" : "bg-olive-50 text-olive-800"
                  }`}
                >
                  <Icon size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-serif text-[1.45rem] font-semibold ${
                      dark ? "" : "text-[#1c2414]"
                    }`}
                  >
                    {title}
                  </span>
                  <span
                    className={`mt-1 block text-[13.5px] leading-relaxed ${
                      dark ? "text-olive-100/85" : "text-olive-600"
                    }`}
                  >
                    {blurb}
                  </span>
                </span>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    dark ? "bg-white/10" : "bg-olive-100 text-olive-800"
                  }`}
                >
                  <ChevronRight size={18} />
                </span>
              </button>

              <ol
                className={`mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4 text-[12px] font-medium ${
                  dark
                    ? "border-white/10 text-olive-100/70"
                    : "border-olive-100 text-olive-500"
                }`}
              >
                {steps.map((label, i) => (
                  <li key={label} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight size={12} className="opacity-50" />}
                    <span>
                      {i + 1}. {label}
                    </span>
                  </li>
                ))}
              </ol>

              <p
                className={`mt-3 text-[12.5px] ${
                  dark ? "text-olive-100/70" : "text-olive-500"
                }`}
              >
                Already registered?{" "}
                <Link
                  href={signInHref}
                  className={`font-semibold underline-offset-2 hover:underline ${
                    dark ? "text-milky-50" : "text-olive-700"
                  }`}
                >
                  Log in
                </Link>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
