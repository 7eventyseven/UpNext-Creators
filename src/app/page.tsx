"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Sparkles, MapPin, LogIn, UserPlus } from "lucide-react";
import { CreatorCard } from "@/components/CreatorCard";
import { FilterChip } from "@/components/FilterChip";
import { StateDropdown } from "@/components/StateDropdown";
import { AnimatedHeadline } from "@/components/AnimatedHeadline";
import { getSortedCreators } from "@/data/creators";
import { getCategories, defaultCategories } from "@/lib/categories";
import { getLoggedInCreator } from "@/lib/creator-auth";
import { defaultSiteContent, SiteContent } from "@/lib/site-content";
import { fetchSiteContent } from "@/lib/site-content-client";
import { Creator } from "@/types";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [state, setState] = useState("All");
  const [categories, setCategories] = useState<string[]>([
    "All",
    ...defaultCategories,
  ]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const creator = await getLoggedInCreator();
      if (cancelled) return;
      if (creator) {
        window.location.replace("/dashboard");
        return;
      }

      const [cats, sorted, site] = await Promise.all([
        getCategories(),
        getSortedCreators(),
        fetchSiteContent(),
      ]);
      if (cancelled) return;

      setCategories(["All", ...cats]);
      setCreators(sorted);
      setContent(site);
      if (site.meta.title) document.title = site.meta.title;
      setReady(true);
    })().catch(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = creators;
    if (category !== "All") {
      list = list.filter((c) => c.category === category);
    }
    if (state !== "All") {
      list = list.filter((c) => c.city === state);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, category, state, creators]);

  if (!ready) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <section className="relative mb-10 text-center overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-olive-200/40 blur-3xl animate-float-slow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-8 right-0 h-32 w-32 rounded-full bg-olive-300/25 blur-2xl animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-12 left-0 h-24 w-24 rounded-full bg-milky-300/50 blur-2xl animate-float"
          style={{ animationDelay: "2s" }}
        />

        <div
          className="relative inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700 mb-5 opacity-0 animate-slide-up"
          style={{ animationDelay: "80ms" }}
        >
          <Link
            href="/admin"
            aria-label="Admin panel"
            title="Admin panel"
            className="rounded-full p-0.5 text-olive-700 transition-colors hover:text-olive-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-400"
          >
            <Sparkles size={14} className="animate-sparkle" />
          </Link>
          {content.hero.eyebrow}
        </div>

        <div className="relative">
          <AnimatedHeadline
            words={content.hero.headlineWords.map((text) => ({ text }))}
          />
        </div>

        <p
          className="relative mt-4 text-olive-600 max-w-xl mx-auto leading-relaxed opacity-0 animate-slide-up"
          style={{ animationDelay: "520ms" }}
        >
          {content.hero.subtitle}
        </p>
      </section>

      <section
        className="mb-8 space-y-4 opacity-0 animate-slide-up"
        style={{ animationDelay: "650ms" }}
      >
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400 transition-colors"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={content.search.placeholder}
            className="input-focus-ring w-full rounded-xl border border-olive-200 bg-milky-50 pl-10 pr-4 py-3 text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-olive-500 shrink-0" />
          <StateDropdown
            value={state}
            onChange={setState}
            includeAll
            className="w-full sm:w-auto min-w-[200px]"
          />
        </div>

        <div className="filter-chip-row">
          <Filter size={16} className="text-olive-500 shrink-0" />
          {categories.map((cat, i) => (
            <FilterChip
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              index={i}
            />
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div
          className="text-center py-16 opacity-0 animate-scale-in"
          style={{ animationDelay: "100ms" }}
        >
          <p className="text-olive-500 text-lg">{content.empty.title}</p>
          <p className="text-olive-400 text-sm mt-1">{content.empty.subtitle}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} index={i} />
          ))}
        </div>
      )}

      <section
        className="relative mt-16 overflow-hidden rounded-2xl border border-olive-200/70 p-8 sm:p-10 text-center text-milky-50 opacity-0 animate-slide-up"
        style={{ animationDelay: "800ms" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-olive-600 via-olive-700 to-olive-800 animate-bg-drift" />
        <div className="relative">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {content.creatorCta.title}
          </h2>
          <p className="mt-2 text-olive-100 max-w-md mx-auto leading-relaxed">
            {content.creatorCta.body}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={content.creatorCta.primaryHref}
              className="btn-lift inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-milky-50 px-6 py-3 font-semibold text-olive-800 hover:bg-milky-100"
            >
              <UserPlus size={18} />
              {content.creatorCta.primaryLabel}
            </Link>
            <Link
              href={content.creatorCta.secondaryHref}
              className="btn-lift inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-milky-50/40 bg-milky-50/10 px-6 py-3 font-semibold text-milky-50 backdrop-blur-sm hover:bg-milky-50/20"
            >
              <LogIn size={18} />
              {content.creatorCta.secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-12 border-t border-olive-200/60 pt-6 pb-2 text-center">
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
