import Link from "next/link";

export default function HowItWorksPage() {
  const steps = [
    {
      n: "01",
      title: "Tell us the vision",
      body: "Share the category, location, budget, and date. A few questions is all it takes.",
    },
    {
      n: "02",
      title: "We find the talent",
      body: "UpNext matches you with creatives who fit — not an endless feed to scroll.",
    },
    {
      n: "03",
      title: "You book and create",
      body: "Review matches, talk on WhatsApp, and book the creative who feels right.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-olive-500">
        How it works
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#1c2414] sm:text-5xl">
        Matched, not hunted.
      </h1>
      <p className="mt-4 max-w-xl text-olive-700/85 leading-relaxed">
        UpNext is built for clients who already know what they need, and creatives
        who want qualified work — not noise.
      </p>
      <ol className="mt-12 space-y-8">
        {steps.map((step) => (
          <li key={step.n} className="rounded-3xl border border-olive-100 bg-white p-6 sm:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-olive-500">
              {step.n}
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1c2414]">
              {step.title}
            </h2>
            <p className="mt-2 text-olive-700/85">{step.body}</p>
          </li>
        ))}
      </ol>
      <Link
        href="/#start"
        className="mt-10 inline-flex rounded-full bg-[#2f3a1c] px-6 py-3 text-sm font-semibold text-milky-50 hover:bg-olive-800"
      >
        Get started
      </Link>
    </div>
  );
}
