"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, Wrench, Loader2 } from "lucide-react";
import {
  AppSettings,
  defaultAppSettings,
  formatNaira,
} from "@/lib/app-settings";
import { fetchAppSettings, updateAppSettings } from "@/lib/app-settings-client";

const inputClass =
  "w-full rounded-xl border border-olive-200 bg-milky-50 px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200";

type PlanKey = keyof AppSettings["subscriptions"];

export default function AdminSettingsPage() {
  const [form, setForm] = useState<AppSettings>(defaultAppSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAppSettings()
      .then(setForm)
      .catch(() => setError("Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  const updatePlan = (
    key: PlanKey,
    patch: Partial<AppSettings["subscriptions"][PlanKey]>
  ) => {
    setForm((prev) => ({
      ...prev,
      subscriptions: {
        ...prev.subscriptions,
        [key]: { ...prev.subscriptions[key], ...patch },
      },
    }));
  };

  const updateFeature = (key: PlanKey, index: number, value: string) => {
    const features = [...form.subscriptions[key].features];
    features[index] = value;
    updatePlan(key, { features });
  };

  const addFeature = (key: PlanKey) => {
    updatePlan(key, {
      features: [...form.subscriptions[key].features, "New feature"],
    });
  };

  const removeFeature = (key: PlanKey, index: number) => {
    const features = form.subscriptions[key].features.filter((_, i) => i !== index);
    if (features.length === 0) return;
    updatePlan(key, { features });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const saved = await updateAppSettings(form);
      setForm(saved);
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-olive-900">Settings</h1>
        <p className="text-olive-600">
          Subscription pricing and site maintenance controls
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <section className="rounded-2xl border border-olive-200/70 bg-milky-50 p-4 sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Wrench size={18} className="text-olive-600" />
                <h2 className="text-lg font-semibold text-olive-900">
                  Maintenance mode
                </h2>
              </div>
              <p className="mt-1 text-sm text-olive-600">
                When on, creator sign in and registration are disabled. Admin
                access stays available.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.maintenanceMode}
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  maintenanceMode: !prev.maintenanceMode,
                }))
              }
              className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                form.maintenanceMode ? "bg-amber-500" : "bg-olive-200"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  form.maintenanceMode ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-olive-700">
              Message shown to users
            </label>
            <textarea
              className={inputClass}
              rows={3}
              value={form.maintenanceMessage}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  maintenanceMessage: e.target.value,
                }))
              }
              required
            />
          </div>

          {form.maintenanceMode && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Maintenance is ON — visitors cannot sign in or register.
            </p>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-olive-900">
              Subscription plans
            </h2>
            <p className="text-sm text-olive-600">
              Prices and copy shown on the public subscribe page
            </p>
          </div>

          {(Object.keys(form.subscriptions) as PlanKey[]).map((key) => {
            const plan = form.subscriptions[key];
            return (
              <div
                key={key}
                className="rounded-2xl border border-olive-200/70 bg-milky-50 p-4 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-olive-900 capitalize">
                    {key} plan
                  </h3>
                  <p className="text-sm text-olive-500">
                    Preview: {plan.price === 0 ? "Free" : formatNaira(plan.price)}
                    /mo
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-olive-700">
                      Display name
                    </label>
                    <input
                      className={inputClass}
                      value={plan.name}
                      onChange={(e) => updatePlan(key, { name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-olive-700">
                      Price (₦ / month)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={plan.price}
                      onChange={(e) =>
                        updatePlan(key, {
                          price: Number(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-olive-700">
                    Description
                  </label>
                  <input
                    className={inputClass}
                    value={plan.description}
                    onChange={(e) =>
                      updatePlan(key, { description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-olive-700">
                    Features
                  </label>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        className={inputClass}
                        value={feature}
                        onChange={(e) =>
                          updateFeature(key, index, e.target.value)
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(key, index)}
                        className="rounded-xl border border-olive-200 p-2.5 text-red-500 hover:bg-red-50 shrink-0"
                        aria-label="Remove feature"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addFeature(key)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-olive-700 hover:text-olive-900"
                  >
                    <Plus size={14} />
                    Add feature
                  </button>
                </div>
              </div>
            );
          })}
        </section>

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
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-olive-600 px-5 py-3 text-sm font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Saving..." : "Save settings"}
        </button>
      </form>
    </div>
  );
}
