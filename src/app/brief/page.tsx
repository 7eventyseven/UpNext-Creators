"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { StateDropdown } from "@/components/StateDropdown";
import { defaultCategories } from "@/lib/categories";
import { nigeriaStates } from "@/lib/nigeria-states";
import {
  budgetOptions,
  createBrief,
  occasionByCategory,
} from "@/lib/briefs";
import { getClient, saveClient, setAppRole } from "@/lib/client-auth";
import { fetchCreators } from "@/data/creators";

const steps = ["Need", "Details", "Contact"] as const;

export default function BriefPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(defaultCategories[0]);
  const [occasion, setOccasion] = useState("");
  const [state, setState] = useState<string>(nigeriaStates[0]);
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState<(typeof budgetOptions)[number]["value"]>(
    budgetOptions[1].value
  );
  const [notes, setNotes] = useState("");
  const [name, setName] = useState(getClient()?.name ?? "");
  const [phone, setPhone] = useState(getClient()?.phone ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const occasions = useMemo(
    () => occasionByCategory[category] ?? ["Other"],
    [category]
  );

  const canNext =
    step === 0
      ? Boolean(category && (occasion || occasions[0]))
      : step === 1
        ? Boolean(state && budget)
        : Boolean(name.trim() && phone.trim());

  const goNext = () => {
    setError("");
    if (step === 0 && !occasion) setOccasion(occasions[0]);
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and WhatsApp number.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      setAppRole("client");
      const client = saveClient({ name, phone });
      let creators;
      try {
        creators = await fetchCreators(true);
      } catch {
        creators = undefined;
      }
      const brief = createBrief({
        clientId: client.id,
        clientName: client.name,
        clientPhone: client.phone,
        category,
        occasion: occasion || occasions[0],
        state,
        date: date || "Flexible",
        budget,
        notes: notes.trim(),
        creators,
      });
      router.push(`/brief/${brief.id}`);
    } catch {
      setError("Could not create your brief. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-8 sm:py-12">
      <button
        type="button"
        onClick={() => (step === 0 ? router.push("/") : setStep((s) => s - 1))}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-olive-600 hover:text-olive-800"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-8">
        <p className="text-sm font-medium text-olive-500 mb-2">
          Step {step + 1} of {steps.length} · {steps[step]}
        </p>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={steps[i]}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step ? "bg-olive-600" : "bg-olive-200"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-olive-200/70 bg-milky-50 p-6 shadow-sm space-y-5">
        {step === 0 && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-olive-900">What do you need?</h1>
              <p className="mt-1 text-sm text-olive-600">
                Pick a category and the kind of project.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {defaultCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setOccasion("");
                    }}
                    className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                      category === c
                        ? "border-olive-600 bg-olive-600 text-milky-50"
                        : "border-olive-200 bg-white text-olive-700 hover:border-olive-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                What&apos;s it for?
              </label>
              <div className="flex flex-wrap gap-2">
                {occasions.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOccasion(o)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                      occasion === o
                        ? "border-olive-600 bg-olive-100 text-olive-800"
                        : "border-olive-200 bg-white text-olive-600 hover:border-olive-400"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-olive-900">Where & when?</h1>
              <p className="mt-1 text-sm text-olive-600">
                So we alert creatives who can actually take the job.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                State
              </label>
              <StateDropdown value={state} onChange={setState} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                Preferred date (optional)
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                Budget
              </label>
              <div className="space-y-2">
                {budgetOptions.map((b) => (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setBudget(b.value)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${
                      budget === b.value
                        ? "border-olive-600 bg-olive-50 text-olive-800"
                        : "border-olive-200 bg-white text-olive-700 hover:border-olive-400"
                    }`}
                  >
                    {b.label}
                    {budget === b.value && <Check size={16} className="text-olive-600" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                Anything else? (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Style, vibe, must-haves..."
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
              />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h1 className="text-2xl font-bold text-olive-900">How do we reach you?</h1>
              <p className="mt-1 text-sm text-olive-600">
                Creatives who accept can contact you to lock in the booking.
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                Your name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
                placeholder="Ada Okafor"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-olive-700">
                WhatsApp number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2.5 text-olive-900 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200"
                placeholder="2348012345678"
              />
            </div>
          </>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        {step < steps.length - 1 ? (
          <button
            type="button"
            disabled={!canNext}
            onClick={goNext}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3.5 font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-50"
          >
            Continue
            <ArrowRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            disabled={!canNext || submitting}
            onClick={() => void handleSubmit()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-olive-600 py-3.5 font-semibold text-milky-50 hover:bg-olive-700 disabled:opacity-50"
          >
            {submitting ? "Matching creatives..." : "Find my creatives"}
            {!submitting && <ArrowRight size={18} />}
          </button>
        )}
      </div>
    </div>
  );
}
