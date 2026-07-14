"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { getCreatorById, saveCreator } from "@/data/creators";
import { getCategories } from "@/lib/categories";
import { StateDropdown } from "@/components/StateDropdown";
import { Creator, Service } from "@/types";

const emptyService = (): Service => ({
  id: `s-${Date.now()}`,
  name: "",
  description: "",
  price: 0,
  duration: "",
});

const emptyCreator = (): Creator => ({
  id: `c-${Date.now()}`,
  name: "",
  username: "",
  avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=New",
  coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
  category: "Photography",
  city: "Plateau",
  location: "",
  bio: "",
  rating: 4.5,
  reviewCount: 0,
  completedBookings: 0,
  rank: 99,
  isSubscribed: false,
  subscriptionTier: "free",
  whatsapp: "",
  tags: [],
  services: [emptyService()],
});

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-olive-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200";

export default function CreatorEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [form, setForm] = useState<Creator>(emptyCreator());
  const [tagInput, setTagInput] = useState("");
  const categories = getCategories();
  const isNew = id === "new";

  useEffect(() => {
    params.then(({ id: paramId }) => {
      setId(paramId);
      if (paramId !== "new") {
        const existing = getCreatorById(paramId);
        if (existing) setForm(existing);
      }
    });
  }, [params]);

  const update = <K extends keyof Creator>(key: K, value: Creator[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateService = (index: number, patch: Partial<Service>) => {
    const services = [...form.services];
    services[index] = { ...services[index], ...patch };
    update("services", services);
  };

  const addService = () => {
    update("services", [...form.services, emptyService()]);
  };

  const removeService = (index: number) => {
    if (form.services.length <= 1) return;
    update(
      "services",
      form.services.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      update("tags", [...form.tags, tag]);
      setTagInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tier = form.subscriptionTier;
    saveCreator({
      ...form,
      isSubscribed: tier === "pro" || tier === "premium",
      location: form.location || `${form.city}, Nigeria`,
    });
    router.push("/admin/creators");
  };

  if (!id) return null;

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <Link
        href="/admin/creators"
        className="mb-6 inline-flex items-center gap-2 text-sm text-olive-600 hover:text-olive-800"
      >
        <ArrowLeft size={16} />
        Back to Creators
      </Link>

      <h1 className="text-2xl font-bold text-olive-900 mb-6">
        {isNew ? "Add Creator" : `Edit ${form.name || "Creator"}`}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 space-y-4">
          <h2 className="font-semibold text-olive-900">Profile</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </Field>
            <Field label="Username">
              <input
                className={inputClass}
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                required
              />
            </Field>
            <Field label="Category">
              <select
                className={inputClass}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State">
              <StateDropdown
                value={form.city}
                onChange={(value) => update("city", value)}
              />
            </Field>
            <Field label="Location">
              <input
                className={inputClass}
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Jos, Plateau State"
              />
            </Field>
            <Field label="WhatsApp">
              <input
                className={inputClass}
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                placeholder="2348012345678"
                required
              />
            </Field>
          </div>
          <Field label="Bio">
            <textarea
              className={`${inputClass} min-h-[80px]`}
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Avatar URL">
              <input
                className={inputClass}
                value={form.avatar}
                onChange={(e) => update("avatar", e.target.value)}
              />
            </Field>
            <Field label="Cover Image URL">
              <input
                className={inputClass}
                value={form.coverImage}
                onChange={(e) => update("coverImage", e.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 space-y-4">
          <h2 className="font-semibold text-olive-900">Ranking & Stats</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Rank">
              <input
                type="number"
                className={inputClass}
                value={form.rank}
                onChange={(e) => update("rank", Number(e.target.value))}
                min={1}
              />
            </Field>
            <Field label="Rating">
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={form.rating}
                onChange={(e) => update("rating", Number(e.target.value))}
                min={0}
                max={5}
              />
            </Field>
            <Field label="Reviews">
              <input
                type="number"
                className={inputClass}
                value={form.reviewCount}
                onChange={(e) => update("reviewCount", Number(e.target.value))}
                min={0}
              />
            </Field>
            <Field label="Completed Bookings">
              <input
                type="number"
                className={inputClass}
                value={form.completedBookings}
                onChange={(e) =>
                  update("completedBookings", Number(e.target.value))
                }
                min={0}
              />
            </Field>
          </div>
          <Field label="Subscription Tier">
            <select
              className={inputClass}
              value={form.subscriptionTier}
              onChange={(e) =>
                update(
                  "subscriptionTier",
                  e.target.value as Creator["subscriptionTier"]
                )
              }
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </Field>
        </section>

        <section className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 space-y-4">
          <h2 className="font-semibold text-olive-900">Tags</h2>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add a tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="shrink-0 rounded-xl bg-olive-600 px-4 text-sm font-semibold text-milky-50 hover:bg-olive-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-olive-100 px-3 py-1 text-sm text-olive-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() =>
                    update(
                      "tags",
                      form.tags.filter((t) => t !== tag)
                    )
                  }
                  className="text-olive-500 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-olive-900">Services</h2>
            <button
              type="button"
              onClick={addService}
              className="inline-flex items-center gap-1 rounded-lg bg-olive-100 px-3 py-1.5 text-sm font-medium text-olive-700 hover:bg-olive-200"
            >
              <Plus size={14} />
              Add Service
            </button>
          </div>
          {form.services.map((service, i) => (
            <div
              key={service.id}
              className="rounded-xl border border-olive-200 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-olive-700">
                  Service {i + 1}
                </p>
                {form.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(i)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    className={inputClass}
                    value={service.name}
                    onChange={(e) =>
                      updateService(i, { name: e.target.value })
                    }
                    required
                  />
                </Field>
                <Field label="Duration">
                  <input
                    className={inputClass}
                    value={service.duration}
                    onChange={(e) =>
                      updateService(i, { duration: e.target.value })
                    }
                    placeholder="2 hours"
                    required
                  />
                </Field>
                <Field label="Price (NGN)">
                  <input
                    type="number"
                    className={inputClass}
                    value={service.price}
                    onChange={(e) =>
                      updateService(i, { price: Number(e.target.value) })
                    }
                    min={0}
                    required
                  />
                </Field>
                <Field label="Discount Price (optional)">
                  <input
                    type="number"
                    className={inputClass}
                    value={service.discountPrice ?? ""}
                    onChange={(e) =>
                      updateService(i, {
                        discountPrice: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                    min={0}
                  />
                </Field>
              </div>
              <Field label="Description">
                <input
                  className={inputClass}
                  value={service.description}
                  onChange={(e) =>
                    updateService(i, { description: e.target.value })
                  }
                  required
                />
              </Field>
            </div>
          ))}
        </section>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-olive-600 px-6 py-3 font-semibold text-milky-50 hover:bg-olive-700"
          >
            {isNew ? "Create Creator" : "Save Changes"}
          </button>
          <Link
            href="/admin/creators"
            className="rounded-xl border border-olive-200 px-6 py-3 font-semibold text-olive-700 hover:bg-olive-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
