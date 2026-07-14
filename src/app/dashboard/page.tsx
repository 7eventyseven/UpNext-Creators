"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, TrendingUp, User, Loader2 } from "lucide-react";
import {
  getLoggedInCreator,
  updateCreatorProfile,
} from "@/lib/creator-auth";
import { getCategories } from "@/lib/categories";
import { StateDropdown } from "@/components/StateDropdown";
import { nigeriaStates } from "@/lib/nigeria-states";
import { formatPrice } from "@/data/creators";
import {
  processImageUpload,
  processVideoUpload,
  uploadLimits,
} from "@/lib/file-upload";
import { ImageUpload, VideoUploadList, VideoEntry } from "@/components/MediaUpload";
import {
  ServiceList,
  ServiceEntry,
  emptyService,
  parseServiceEntries,
  serviceToEntry,
} from "@/components/ServiceList";
import { AuthSection, authInputClass } from "@/components/auth/AuthSection";
import { Creator } from "@/types";

const inputClass = authInputClass;

export default function DashboardPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [state, setState] = useState<string>(nigeriaStates[0]);
  const [category, setCategory] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [services, setServices] = useState<ServiceEntry[]>([emptyService()]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
    getLoggedInCreator().then((loggedIn) => {
      if (!loggedIn) {
        router.replace("/signin");
        return;
      }
      setCreator(loggedIn);
      setName(loggedIn.name);
      setBio(loggedIn.bio);
      setState(loggedIn.city);
      setCategory(loggedIn.category);
      setWhatsapp(loggedIn.whatsapp);
      setAvatar(loggedIn.avatar);
      setVideos(
        (loggedIn.videos ?? []).map((v) => ({
          id: v.id,
          title: v.title,
          earnings: String(v.earnings),
          url: v.url,
        }))
      );
      setServices(
        loggedIn.services.length > 0
          ? loggedIn.services.map(serviceToEntry)
          : [emptyService()]
      );
    });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) return;

    setSaving(true);
    setError("");
    setMessage("");

    const completedVideos = videos
      .filter((v) => v.url && v.title.trim())
      .sort((a, b) => Number(b.earnings) - Number(a.earnings))
      .map((v) => ({
        id: v.id,
        title: v.title.trim(),
        url: v.url!,
        earnings: Number(v.earnings) || 0,
      }));

    const parsedServices = parseServiceEntries(services);
    if (parsedServices.length === 0) {
      setError("Please add at least one service with a name, price, and duration.");
      setSaving(false);
      return;
    }

    try {
      const updated = await updateCreatorProfile(creator.id, {
        name: name.trim(),
        bio: bio.trim(),
        city: state,
        location: `${state}, Nigeria`,
        category,
        whatsapp: whatsapp.replace(/\D/g, ""),
        avatar: avatar ?? creator.avatar,
        videos: completedVideos,
        services: parsedServices,
      });
      setMessage("Profile updated successfully.");
      setCreator(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (!creator) return null;

  const totalEarnings = (creator.videos ?? []).reduce(
    (sum, v) => sum + v.earnings,
    0
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-olive-900">Creator Dashboard</h1>
        <p className="text-olive-600">
          Manage your profile, services, and showcase
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-olive-200/70 bg-milky-50 p-4">
          <div className="flex items-center gap-2 text-olive-600 text-sm">
            <User size={16} />
            Rank
          </div>
          <p className="mt-1 text-2xl font-bold text-olive-900">#{creator.rank}</p>
        </div>
        <div className="rounded-xl border border-olive-200/70 bg-milky-50 p-4">
          <div className="flex items-center gap-2 text-olive-600 text-sm">
            <TrendingUp size={16} />
            Video Earnings
          </div>
          <p className="mt-1 text-2xl font-bold text-olive-900">
            {formatPrice(totalEarnings)}
          </p>
        </div>
        <div className="rounded-xl border border-olive-200/70 bg-milky-50 p-4">
          <p className="text-olive-600 text-sm">Tier</p>
          <p className="mt-1 text-2xl font-bold text-olive-900 capitalize">
            {creator.subscriptionTier}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-olive-200/70 bg-milky-50 p-6 shadow-sm"
      >
        <ImageUpload
          label="Profile Picture"
          value={avatar}
          onChange={setAvatar}
          onError={setError}
          processFile={processImageUpload}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-olive-700">
              Name
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-olive-700">
              Category
            </label>
            <select
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-olive-700">
              State
            </label>
            <StateDropdown value={state} onChange={setState} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-olive-700">
              WhatsApp
            </label>
            <input
              className={inputClass}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-olive-700">
            Bio
          </label>
          <textarea
            className={`${inputClass} min-h-[100px]`}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            required
          />
        </div>

        <AuthSection
          title="Services & Pricing"
          description="Update what you offer and your rates"
        >
          <ServiceList services={services} onChange={setServices} />
        </AuthSection>

        <AuthSection
          title="Showcase Videos"
          description="Your highest grossing work"
        >
          <VideoUploadList
            videos={videos}
            onChange={setVideos}
            onError={setError}
            maxVideos={uploadLimits.maxVideos}
            processFile={processVideoUpload}
          />
        </AuthSection>

        {message && (
          <p className="rounded-lg bg-olive-50 px-3 py-2 text-sm text-olive-700">
            {message}
          </p>
        )}
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3 font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
