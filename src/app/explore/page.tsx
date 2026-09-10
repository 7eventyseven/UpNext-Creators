"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Filter, MapPin, ArrowLeft } from "lucide-react";
import { CreatorCard } from "@/components/CreatorCard";
import { FilterChip } from "@/components/FilterChip";
import { StateDropdown } from "@/components/StateDropdown";
import { getSortedCreators } from "@/data/creators";
import { getCategories, defaultCategories } from "@/lib/categories";
import type { Creator } from "@/types";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [state, setState] = useState("All");
  const [categories, setCategories] = useState<string[]>([
    "All",
    ...defaultCategories,
  ]);
  const [allCreators, setAllCreators] = useState<Creator[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const [cats, creators] = await Promise.all([
          getCategories(),
          getSortedCreators(),
        ]);
        setCategories(["All", ...cats]);
        setAllCreators(creators);
      } catch {
        setCategories(["All", ...defaultCategories]);
      }
    })();
  }, []);

  const creators = useMemo(() => {
    let list = allCreators;
    if (category !== "All") list = list.filter((c) => c.category === category);
    if (state !== "All") list = list.filter((c) => c.city === state);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [search, category, state, allCreators]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-olive-600 hover:text-olive-800"
      >
        <ArrowLeft size={16} />
        Home
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive-900">Explore creatives</h1>
        <p className="mt-2 text-olive-600 max-w-xl">
          Browse the directory anytime. For faster matching,{" "}
          <Link href="/brief" className="font-semibold text-olive-700 underline">
            start a brief
          </Link>{" "}
          instead.
        </p>
      </div>

      <section className="mb-8 space-y-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search creatives..."
            className="w-full rounded-xl border border-olive-200 bg-milky-50 pl-10 pr-4 py-3 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
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

      {creators.length === 0 ? (
        <p className="text-center text-olive-500 py-12">No creatives found.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
