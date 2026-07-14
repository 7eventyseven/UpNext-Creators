"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Crown, Star } from "lucide-react";
import {
  getAllCreators,
  deleteCreator,
  formatPrice,
} from "@/data/creators";
import { Creator } from "@/types";

function CreatorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);

  const load = async () => {
    setCreators(await getAllCreators());
  };

  useEffect(() => {
    load().catch(() => undefined);
    if (searchParams.get("new") === "1") {
      router.replace("/admin/creators/new");
    }
  }, [searchParams, router]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete ${name}? This cannot be undone.`)) {
      await deleteCreator(id);
      await load();
    }
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-olive-900">Creators</h1>
          <p className="text-olive-600">Manage creator profiles and listings</p>
        </div>
        <Link
          href="/admin/creators/new"
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-4 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
        >
          <Plus size={16} />
          Add Creator
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-olive-200/70 bg-milky-50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-olive-200 bg-olive-50/50 text-left text-olive-600">
                <th className="px-4 py-3 font-medium">Creator</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">State</th>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Tier</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {creators.map((creator) => (
                <tr
                  key={creator.id}
                  className="border-b border-olive-100 last:border-0 hover:bg-olive-50/30"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={creator.avatar}
                        alt={creator.name}
                        width={36}
                        height={36}
                        className="rounded-full bg-olive-100"
                      />
                      <div>
                        <p className="font-medium text-olive-900">{creator.name}</p>
                        <p className="text-xs text-olive-500">@{creator.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-olive-700">{creator.category}</td>
                  <td className="px-4 py-3 text-olive-700">{creator.city}</td>
                  <td className="px-4 py-3 text-olive-700">#{creator.rank}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        creator.subscriptionTier === "premium"
                          ? "bg-amber-100 text-amber-800"
                          : creator.subscriptionTier === "pro"
                            ? "bg-olive-100 text-olive-700"
                            : "bg-olive-50 text-olive-500"
                      }`}
                    >
                      {creator.subscriptionTier === "premium" && <Crown size={10} />}
                      {creator.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-olive-700">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {creator.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/creators/${creator.id}`}
                        className="rounded-lg p-2 text-olive-600 hover:bg-olive-100"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(creator.id, creator.name)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {creators.length === 0 && (
          <p className="py-12 text-center text-olive-500">No creators yet.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminCreatorsPage() {
  return (
    <Suspense>
      <CreatorsContent />
    </Suspense>
  );
}
