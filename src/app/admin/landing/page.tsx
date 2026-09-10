"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, RotateCcw, Save, Loader2 } from "lucide-react";
import { defaultSiteContent, SiteContent } from "@/lib/site-content";
import {
  fetchSiteContent,
  resetSiteContent,
  updateSiteContent,
} from "@/lib/site-content-client";

const inputClass =
  "w-full rounded-xl border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-olive-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-olive-500">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 sm:p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-olive-900">{title}</h2>
        <p className="text-sm text-olive-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function AdminLandingPage() {
  const [form, setForm] = useState<SiteContent>(defaultSiteContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSiteContent()
      .then(setForm)
      .catch(() => setError("Could not load landing content."))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof SiteContent>(
    section: K,
    patch: Partial<SiteContent[K]>
  ) => {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...patch },
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const words = form.hero.headlineWords
        .map((w) => w.trim())
        .filter(Boolean);
      if (words.length === 0) {
        throw new Error("Headline needs at least one word.");
      }
      const saved = await updateSiteContent({
        ...form,
        hero: { ...form.hero, headlineWords: words },
      });
      setForm(saved);
      setMessage("Landing page saved. Changes are live on the site.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all landing page copy to defaults?")) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const content = await resetSiteContent();
      setForm(content);
      setMessage("Reset to defaults.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-olive-900">Landing Page</h1>
          <p className="text-olive-600">
            Edit headlines, button labels, and marketplace copy
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-olive-200 px-3 py-2 text-sm font-medium text-olive-700 hover:bg-olive-50"
          >
            <ExternalLink size={14} />
            Preview
          </Link>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-olive-200 px-3 py-2 text-sm font-medium text-olive-700 hover:bg-olive-50 disabled:opacity-60"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <Section
          title="Brand & SEO"
          description="Logo wordmark and browser meta tags"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Logo primary">
              <input
                className={inputClass}
                value={form.brand.logoPrimary}
                onChange={(e) => update("brand", { logoPrimary: e.target.value })}
                required
              />
            </Field>
            <Field label="Logo secondary">
              <input
                className={inputClass}
                value={form.brand.logoSecondary}
                onChange={(e) =>
                  update("brand", { logoSecondary: e.target.value })
                }
                required
              />
            </Field>
          </div>
          <Field label="Page title">
            <input
              className={inputClass}
              value={form.meta.title}
              onChange={(e) => update("meta", { title: e.target.value })}
              required
            />
          </Field>
          <Field label="Meta description">
            <textarea
              className={inputClass}
              rows={2}
              value={form.meta.description}
              onChange={(e) => update("meta", { description: e.target.value })}
              required
            />
          </Field>
        </Section>

        <Section
          title="Header navigation"
          description="Nav links and auth button labels for guests"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Browse label">
              <input
                className={inputClass}
                value={form.header.navBrowse}
                onChange={(e) => update("header", { navBrowse: e.target.value })}
                required
              />
            </Field>
            <Field label="Bookings label">
              <input
                className={inputClass}
                value={form.header.navBookings}
                onChange={(e) =>
                  update("header", { navBookings: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Sign out label">
              <input
                className={inputClass}
                value={form.header.signOutLabel}
                onChange={(e) =>
                  update("header", { signOutLabel: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Sign In button">
              <input
                className={inputClass}
                value={form.header.signInLabel}
                onChange={(e) =>
                  update("header", { signInLabel: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Register button">
              <input
                className={inputClass}
                value={form.header.registerLabel}
                onChange={(e) =>
                  update("header", { registerLabel: e.target.value })
                }
                required
              />
            </Field>
          </div>
        </Section>

        <Section title="Hero" description="First viewport headline and intro">
          <Field label="Eyebrow badge">
            <input
              className={inputClass}
              value={form.hero.eyebrow}
              onChange={(e) => update("hero", { eyebrow: e.target.value })}
              required
            />
          </Field>
          <Field
            label="Headline words"
            hint="Comma-separated words shown in the animated headline"
          >
            <input
              className={inputClass}
              value={form.hero.headlineWords.join(", ")}
              onChange={(e) =>
                update("hero", {
                  headlineWords: e.target.value
                    .split(",")
                    .map((w) => w.trim())
                    .filter(Boolean),
                })
              }
              required
            />
          </Field>
          <Field label="Supporting sentence">
            <textarea
              className={inputClass}
              rows={3}
              value={form.hero.subtitle}
              onChange={(e) => update("hero", { subtitle: e.target.value })}
              required
            />
          </Field>
        </Section>

        <Section title="Search & empty state" description="Filter and empty copy">
          <Field label="Search placeholder">
            <input
              className={inputClass}
              value={form.search.placeholder}
              onChange={(e) =>
                update("search", { placeholder: e.target.value })
              }
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Empty title">
              <input
                className={inputClass}
                value={form.empty.title}
                onChange={(e) => update("empty", { title: e.target.value })}
                required
              />
            </Field>
            <Field label="Empty subtitle">
              <input
                className={inputClass}
                value={form.empty.subtitle}
                onChange={(e) => update("empty", { subtitle: e.target.value })}
                required
              />
            </Field>
          </div>
        </Section>

        <Section
          title="Creator CTA band"
          description="Bottom call-to-action buttons and copy"
        >
          <Field label="Title">
            <input
              className={inputClass}
              value={form.creatorCta.title}
              onChange={(e) =>
                update("creatorCta", { title: e.target.value })
              }
              required
            />
          </Field>
          <Field label="Body">
            <textarea
              className={inputClass}
              rows={3}
              value={form.creatorCta.body}
              onChange={(e) => update("creatorCta", { body: e.target.value })}
              required
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Primary button label">
              <input
                className={inputClass}
                value={form.creatorCta.primaryLabel}
                onChange={(e) =>
                  update("creatorCta", { primaryLabel: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Primary button link">
              <input
                className={inputClass}
                value={form.creatorCta.primaryHref}
                onChange={(e) =>
                  update("creatorCta", { primaryHref: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Secondary button label">
              <input
                className={inputClass}
                value={form.creatorCta.secondaryLabel}
                onChange={(e) =>
                  update("creatorCta", { secondaryLabel: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Secondary button link">
              <input
                className={inputClass}
                value={form.creatorCta.secondaryHref}
                onChange={(e) =>
                  update("creatorCta", { secondaryHref: e.target.value })
                }
                required
              />
            </Field>
          </div>
        </Section>

        {message && (
          <p className="rounded-lg bg-olive-100 px-3 py-2 text-sm text-olive-800">
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
          className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-3 text-sm font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save landing page"}
        </button>
      </form>
    </div>
  );
}
