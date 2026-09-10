import Link from "next/link";

export default function BusinessesPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-olive-500">
        For businesses
      </p>
      <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#1c2414] sm:text-5xl">
        Brief once. Meet the right creatives.
      </h1>
      <p className="mt-4 max-w-xl text-olive-700/85 leading-relaxed">
        Brands and teams use UpNext to staff photography, video, design, music,
        and events — without hunting through a feed.
      </p>
      <Link
        href="/brief"
        className="mt-10 inline-flex rounded-full bg-[#2f3a1c] px-6 py-3 text-sm font-semibold text-milky-50 hover:bg-olive-800"
      >
        Start a brief
      </Link>
    </div>
  );
}
