"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bolt,
  CalendarCheck,
  ChevronRight,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { getLoggedInClient, setAppRole } from "@/lib/client-auth";
import { HeroGallery } from "@/components/home/HeroGallery";

const features = [
  { icon: Bolt, label: "Smart matching" },
  { icon: Users, label: "Verified creatives" },
  { icon: CalendarCheck, label: "Seamless booking" },
  { icon: ShieldCheck, label: "Safe & reliable" },
];

// The tiles are landscape but the photos are portrait, so `focus` keeps the
// subject in frame instead of letting a centre crop cut it off.
const categories = [
  {
    name: "Photography",
    blurb: "Capture your story",
    image: "/images/photography.png",
    focus: "center 45%",
  },
  {
    name: "Videography",
    blurb: "Bring ideas to life",
    image: "/images/videography.png",
    focus: "center 35%",
  },
  {
    name: "Design",
    blurb: "Make it look amazing",
    image: "/images/graphic-design.png",
    focus: "center 45%",
  },
  {
    name: "Music",
    blurb: "Turn sound into impact",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=600&q=80",
    focus: "center",
  },
  {
    name: "Content Creation",
    blurb: "For every platform",
    image: "/images/beauty-portrait.png",
    focus: "center 25%",
  },
  {
    name: "Styling",
    blurb: "Look your best",
    image: "/images/makeup-station.png",
    focus: "center 40%",
  },
  {
    name: "Event Coverage",
    blurb: "Moments that matter",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80",
    focus: "center",
  },
];

const joinAvatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&q=80",
];

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    void (async () => {
      const creator = await getLoggedInCreator();
      if (creator) {
        router.replace("/dashboard");
        return;
      }
      const client = await getLoggedInClient();
      if (client) {
        router.replace("/client");
      }
    })();
  }, [router]);

  const chooseClient = () => {
    setAppRole("client");
    router.push("/client/register");
  };

  const chooseCreative = () => {
    setAppRole("creator");
    router.push("/register");
  };

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-10 pt-3 sm:px-8 lg:px-10 lg:pt-4">
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6 xl:gap-10">
        <div className="max-w-[540px]">
          <p className="animate-slide-up text-[11px] font-medium uppercase tracking-[0.28em] text-olive-500">
            Creative talent. Real opportunities.
          </p>
          <h1
            className="animate-slide-up mt-3 font-serif text-[2.35rem] font-semibold leading-[1.05] tracking-[-0.02em] text-[#1c2414] sm:text-[2.75rem] lg:text-[3.35rem] xl:text-[3.6rem]"
            style={{ animationDelay: "0.08s" }}
          >
            Tell us the vision.
            <br />
            We&apos;ll find the talent.
          </h1>
          <p
            className="animate-slide-up mt-4 max-w-[420px] text-[14.5px] leading-relaxed text-olive-700/85"
            style={{ animationDelay: "0.16s" }}
          >
            Nigeria&apos;s number one marketplace for creative talent. Discover
            who fits your vision, match, and book. No long thing.
          </p>
          <ul className="mt-6 space-y-2">
            {features.map(({ icon: Icon, label }, i) => (
              <li
                key={label}
                className="animate-slide-up flex items-center gap-3 text-[14px] font-medium text-olive-800"
                style={{ animationDelay: `${0.24 + i * 0.07}s` }}
              >
                <Icon size={16} className="text-olive-600" strokeWidth={1.75} />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <HeroGallery />
      </section>

      <section
        id="start"
        className="mt-8 grid scroll-mt-28 gap-4 lg:grid-cols-2 lg:mt-10"
      >
        <button
          type="button"
          onClick={chooseClient}
          style={{ animationDelay: "0.5s" }}
          className="animate-slide-up group flex items-center gap-4 rounded-[1.75rem] border border-olive-100 bg-white px-5 py-4 text-left shadow-[0_10px_40px_rgba(47,58,28,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(47,58,28,0.12)] sm:px-6 sm:py-5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-olive-50 text-olive-800">
            <Search size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-[1.45rem] font-semibold text-[#1c2414]">
              I need a creative
            </span>
            <span className="mt-1 block max-w-[340px] text-[13.5px] leading-relaxed text-olive-600">
              Create a free account, answer a few questions, and we&apos;ll
              match you with creatives who fit your project.
            </span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-olive-100 text-olive-800 transition-transform group-hover:translate-x-0.5">
            <ChevronRight size={18} />
          </span>
        </button>

        <button
          type="button"
          onClick={chooseCreative}
          style={{ animationDelay: "0.6s" }}
          className="animate-slide-up group flex items-center gap-4 rounded-[1.75rem] bg-[#2f3a1c] px-5 py-4 text-left text-milky-50 shadow-[0_12px_40px_rgba(47,58,28,0.18)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(47,58,28,0.28)] sm:px-6 sm:py-5"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
            <UserRound size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-serif text-[1.45rem] font-semibold">
              I am a creative
            </span>
            <span className="mt-1 block max-w-[340px] text-[13.5px] leading-relaxed text-olive-100/85">
              Set up your profile — or log in — and get qualified briefs from
              clients who already know what they want.
            </span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:translate-x-0.5">
            <ChevronRight size={18} />
          </span>
        </button>
      </section>

      <section className="mt-12 lg:mt-14">
        <div
          className="animate-fade-in mb-6 flex items-center gap-4"
          style={{ animationDelay: "0.65s" }}
        >
          <div className="h-px flex-1 bg-olive-200/80" />
          <p className="shrink-0 text-[11px] font-medium uppercase tracking-[0.32em] text-olive-500">
            Trusted by creatives and brands
          </p>
          <div className="h-px flex-1 bg-olive-200/80" />
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-7 lg:gap-x-5">
          {categories.map((category, i) => (
            <Link
              key={category.name}
              href="/explore"
              className="animate-scale-in group block transition-transform duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${0.7 + i * 0.06}s` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 1024px) 45vw, 160px"
                  style={{ objectPosition: category.focus }}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <p className="mt-3 text-[14px] font-semibold text-[#1c2414]">
                {category.name}
              </p>
              <p className="mt-0.5 text-[12.5px] text-olive-600">{category.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 flex justify-center pb-4">
        <Link
          href="/#start"
          style={{ animationDelay: "1.2s" }}
          className="animate-fade-in inline-flex items-center gap-3 rounded-full border border-olive-200/90 bg-white py-2 pl-2 pr-2 text-olive-800 shadow-[0_8px_30px_rgba(47,58,28,0.06)] transition-transform hover:-translate-y-0.5"
        >
          <span className="flex -space-x-2 pl-1">
            {joinAvatars.map((src) => (
              <span
                key={src}
                className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white"
              >
                <Image src={src} alt="" fill sizes="32px" className="object-cover" />
              </span>
            ))}
          </span>
          <span className="px-1 text-[13.5px] font-medium">
            Join thousands of creatives and clients on UpNext
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-50">
            <ChevronRight size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
}
