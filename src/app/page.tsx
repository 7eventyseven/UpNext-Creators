"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Sparkles } from "lucide-react";
import { CreatorCard } from "@/components/CreatorCard";
import { getSortedCreators } from "@/data/creators";

const categories = [
  "All",
  "Photography",
  "Music Production",
  "Makeup & Beauty",
  "Videography",
  "Graphic Design",
  "Content Creation",
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const creators = useMemo(() => {
    let list = getSortedCreators();
    if (category !== "All") {
      list = list.filter((c) => c.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <section className="mb-10 text-center animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700 mb-4">
          <Sparkles size={14} />
          Jos Plateau&apos;s Creator Marketplace
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-olive-900 tracking-tight">
          Discover Top Creators
        </h1>
        <p className="mt-3 text-olive-600 max-w-xl mx-auto leading-relaxed">
          Book photographers, musicians, makeup artists, designers, and more —
          all ranked and ready to bring your vision to life on the Plateau.
        </p>
      </section>

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
            placeholder="Search creators, categories, or locations..."
            className="w-full rounded-xl border border-olive-200 bg-milky-50 pl-10 pr-4 py-3 text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter size={16} className="text-olive-500 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-olive-600 text-milky-50"
                  : "bg-milky-100 text-olive-600 border border-olive-200 hover:bg-olive-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {creators.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-olive-500 text-lg">No creators found.</p>
          <p className="text-olive-400 text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator, i) => (
            <CreatorCard key={creator.id} creator={creator} index={i} />
          ))}
        </div>
      )}

      <section className="mt-16 rounded-2xl border border-olive-200/70 bg-gradient-to-br from-olive-600 to-olive-700 p-8 text-center text-milky-50">
        <h2 className="text-2xl font-bold">Are you a creator on the Plateau?</h2>
        <p className="mt-2 text-olive-100 max-w-md mx-auto">
          Subscribe to rank higher, get more bookings, and connect directly with clients.
        </p>
        <a
          href="/subscribe"
          className="mt-5 inline-block rounded-xl bg-milky-50 px-6 py-3 font-semibold text-olive-800 transition-colors hover:bg-milky-100"
        >
          View Subscription Plans
        </a>
      </section>
    </div>
  );
}
