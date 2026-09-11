import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-olive-200/70 bg-milky-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-olive-500 sm:flex-row sm:px-6">
        <p>
          © {new Date().getFullYear()} UpNext Creators. Nigeria&apos;s creator
          marketplace.
        </p>
        <Link
          href="/admin/login"
          className="text-xs text-olive-400 transition-colors hover:text-olive-700"
        >
          Admin
        </Link>
      </div>
    </footer>
  );
}
