"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, RotateCcw } from "lucide-react";
import {
  getCategories,
  addCategory,
  removeCategory,
  resetCategories,
  defaultCategories,
} from "@/lib/categories";
import { getAllCreators } from "@/data/creators";
import { Creator } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const load = async () => {
    const [cats, allCreators] = await Promise.all([
      getCategories(),
      getAllCreators(),
    ]);
    setCategories(cats);
    setCreators(allCreators);
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCategory(newCategory);
      setNewCategory("");
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to add category");
    }
  };

  const handleRemove = async (name: string) => {
    if (!confirm(`Remove category "${name}"?`)) return;
    try {
      await removeCategory(name);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove category");
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset categories to defaults?")) return;
    await resetCategories();
    await load();
  };

  const creatorCount = (cat: string) =>
    creators.filter((c) => c.category === cat).length;

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-olive-900">Categories</h1>
          <p className="text-olive-600">
            Manage service categories shown in filters
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-xl border border-olive-200 px-3 py-2 text-sm font-medium text-olive-700 hover:bg-olive-50"
        >
          <RotateCcw size={14} />
          Reset Defaults
        </button>
      </div>

      <form
        onSubmit={handleAdd}
        className="mb-6 flex gap-2 rounded-2xl border border-olive-200/70 bg-milky-50 p-4"
      >
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name..."
          className="flex-1 rounded-xl border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-4 py-2.5 text-sm font-semibold text-milky-50 hover:bg-olive-700"
        >
          <Plus size={16} />
          Add
        </button>
      </form>

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat}
            className="flex items-center justify-between rounded-xl border border-olive-200/70 bg-milky-50 px-4 py-3"
          >
            <div>
              <p className="font-medium text-olive-900">{cat}</p>
              <p className="text-xs text-olive-500">
                {creatorCount(cat)} creator{creatorCount(cat) !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleRemove(cat)}
              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <p className="text-center text-olive-500 py-8">No categories.</p>
      )}

      <p className="mt-6 text-xs text-olive-500">
        Default categories: {defaultCategories.join(", ")}
      </p>
    </div>
  );
}
