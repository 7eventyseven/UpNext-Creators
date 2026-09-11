"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Phone } from "lucide-react";
import { StateDropdown } from "@/components/StateDropdown";
import { defaultCategories } from "@/lib/categories";
import { nigeriaStates } from "@/lib/nigeria-states";
import {
  budgetOptions,
  createBrief,
  occasionByCategory,
} from "@/lib/briefs";
import { getLoggedInClient, setAppRole } from "@/lib/client-auth";
import { BRIEF_STEPS as steps, CLIENT_FLOW_STEPS } from "@/lib/client-flow";
import { getSortedCreators } from "@/data/creators";
import type { ClientProfile } from "@/types";

export default function BriefPage() {
  const router = useRouter();
  const [client, setClient] = useState<ClientProfile | null>(null);
  /** Set when arriving straight from registration, so the progress bar continues. */
  const [justRegistered, setJustRegistered] = useState(false);
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(defaultCategories[0]);
  const [occasion, setOccasion] = useState("");
  const [state, setState] = useState<string>(nigeriaStates[0]);
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState<(typeof budgetOptions)[number]["value"]>(
    budgetOptions[1].value
  );
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setJustRegistered(
      new URLSearchParams(window.location.search).get("new") === "1"
    );
    void (async () => {
      const loggedIn = await getLoggedInClient();
      if (!loggedIn) {
        router.replace("/client/register");
        return;
      }
      setClient(loggedIn);
    })();
  }, [router]);

  const occasions = useMemo(
    () => occasionByCategory[category] ?? ["Other"],
    [category]
  );

  const canNext =
    step === 0
      ? Boolean(category && (occasion || occasions[0]))
      : Boolean(state && budget);

  const goNext = () => {
    setError("");
    if (step === 0 && !occasion) setOccasion(occasions[0]);
    if (step < steps.length - 1) setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    if (!client) return;
    setSubmitting(true);
    setError("");
    try {
      setAppRole("client");
      let creators;
      try {
        creators = await getSortedCreators();
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

  if (!client) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  const offset = justRegistered ? CLIENT_FLOW_STEPS.length - steps.length : 0;
  const trackLength = steps.length + offset;

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
          Step {step + 1 + offset} of {trackLength} · {steps[step]}
        </p>
        <div className="flex gap-2">
          {Array.from({ length: trackLength }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i <= step + offset ? "bg-olive-600" : "bg-olive-200"
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
            <p className="flex items-start gap-2 rounded-xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
              <Phone size={14} className="mt-0.5 shrink-0" />
              Creatives who accept will reach {client.name.split(" ")[0]} on{" "}
              {client.phone}.
            </p>
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
