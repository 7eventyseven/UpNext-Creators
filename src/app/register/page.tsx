"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, UserPlus } from "lucide-react";
import { getCategories } from "@/lib/categories";
import { StateDropdown } from "@/components/StateDropdown";
import { SelectDropdown } from "@/components/SelectDropdown";
import { nigeriaStates } from "@/lib/nigeria-states";
import { registerCreator, getLoggedInCreator } from "@/lib/creator-auth";
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
} from "@/components/ServiceList";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthSection, authInputClass, authLabelClass } from "@/components/auth/AuthSection";
import { MaintenanceNotice } from "@/components/MaintenanceNotice";
import { AppSettings, defaultAppSettings } from "@/lib/app-settings";
import { fetchAppSettings } from "@/lib/app-settings-client";

export default function RegisterPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const categoryOptions = categories.map((c) => ({ value: c, label: c }));
  const [settings, setSettings] = useState<AppSettings>(defaultAppSettings);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [category, setCategory] = useState("");
  const [state, setState] = useState<string>(nigeriaStates[0]);
  const [bio, setBio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [services, setServices] = useState<ServiceEntry[]>([emptyService()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppSettings().then(setSettings);
    getCategories().then((cats) => {
      setCategories(cats);
      setCategory((prev) => prev || cats[0] || "");
    });
    getLoggedInCreator().then((creator) => {
      if (creator) router.replace("/dashboard");
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (settings.maintenanceMode) {
      setError(settings.maintenanceMessage);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!avatar) {
      setError("Please upload a profile picture.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }

    const completedVideos = videos.filter((v) => v.url && v.title.trim());
    if (completedVideos.length === 0) {
      setError("Please upload at least one video with a title.");
      return;
    }

    const parsedServices = parseServiceEntries(services);
    if (parsedServices.length === 0) {
      setError("Please add at least one service with a name, price, and duration.");
      return;
    }

    setLoading(true);
    try {
      await registerCreator({
        name: name.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        category,
        city: state,
        bio: bio.trim(),
        whatsapp: whatsapp.trim(),
        avatar,
        services: parsedServices,
        videos: completedVideos
          .sort((a, b) => Number(b.earnings) - Number(a.earnings))
          .map((v) => ({
            id: v.id,
            title: v.title.trim(),
            url: v.url!,
            earnings: Number(v.earnings) || 0,
          })),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Join UpNext Creators"
      title="Start your creator journey"
      subtitle="Register in minutes — choose your category, upload your photo, and showcase your highest grossing videos to clients across Nigeria."
    >
      <div className="mb-8 lg:hidden">
        <div className="inline-flex items-center gap-2 rounded-full bg-olive-100 px-4 py-1.5 text-sm font-medium text-olive-700 mb-4">
          <Sparkles size={14} />
          Creator Registration
        </div>
        <h1 className="text-3xl font-bold text-olive-900 tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-olive-600">
          Join Nigeria&apos;s marketplace for talented creators
        </p>
      </div>

      <div className="hidden lg:block mb-8">
        <h1 className="text-3xl font-bold text-olive-900 tracking-tight">
          Register as a creator
        </h1>
        <p className="mt-2 text-olive-600">
          Fill in your details below to get listed on UpNext
        </p>
      </div>

      <MaintenanceNotice settings={settings} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthSection
          title="Account"
          description="Your login credentials"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="email" className={authLabelClass}>
                Email address *
              </label>
              <input
                id="email"
                type="email"
                className={authInputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className={authLabelClass}>
                Password *
              </label>
              <input
                id="password"
                type="password"
                className={authInputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                required
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className={authLabelClass}>
                Confirm password *
              </label>
              <input
                id="confirm-password"
                type="password"
                className={authInputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                required
              />
            </div>
          </div>
        </AuthSection>

        <AuthSection
          title="Profile"
          description="How clients will find and contact you"
        >
          <ImageUpload
            label="Profile picture *"
            value={avatar}
            onChange={setAvatar}
            onError={setError}
            processFile={processImageUpload}
            hint={`JPG, PNG, or WebP — max ${uploadLimits.maxImageMB} MB`}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={authLabelClass}>
                Full name *
              </label>
              <input
                id="name"
                className={authInputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Amina Ibrahim"
                required
              />
            </div>
            <div>
              <label htmlFor="username" className={authLabelClass}>
                Username *
              </label>
              <input
                id="username"
                className={authInputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
              />
            </div>
            <div>
              <label className={authLabelClass}>Category *</label>
              <SelectDropdown
                value={category}
                onChange={setCategory}
                options={categoryOptions}
                placeholder="Select category"
              />
            </div>
            <div>
              <label className={authLabelClass}>State *</label>
              <StateDropdown value={state} onChange={setState} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="whatsapp" className={authLabelClass}>
                WhatsApp number *
              </label>
              <input
                id="whatsapp"
                className={authInputClass}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="2348012345678"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bio" className={authLabelClass}>
                Bio *
              </label>
              <textarea
                id="bio"
                className={`${authInputClass} min-h-[100px] resize-y`}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell clients about your work, style, and experience..."
                required
              />
            </div>
          </div>
        </AuthSection>

        <AuthSection
          title="Services & Pricing"
          description="What you offer and how much you charge"
        >
          <ServiceList services={services} onChange={setServices} />
        </AuthSection>

        <AuthSection
          title="Showcase"
          description="Upload your highest grossing videos to stand out"
        >
          <VideoUploadList
            videos={videos}
            onChange={setVideos}
            onError={setError}
            maxVideos={uploadLimits.maxVideos}
            processFile={processVideoUpload}
          />
        </AuthSection>

        {error && (
          <p className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || settings.maintenanceMode}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3.5 font-semibold text-milky-50 shadow-sm hover:bg-olive-700 hover:shadow-md transition-all disabled:opacity-60"
        >
          <UserPlus size={18} />
          {loading ? "Creating your account..." : "Create Creator Account"}
        </button>

        <p className="text-center text-sm text-olive-600 pb-4">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold text-olive-700 hover:text-olive-900 underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
