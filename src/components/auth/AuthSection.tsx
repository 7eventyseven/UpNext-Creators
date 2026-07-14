interface AuthSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function AuthSection({ title, description, children }: AuthSectionProps) {
  return (
    <section className="rounded-2xl border border-olive-200/70 bg-milky-50 p-5 sm:p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-semibold text-olive-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-olive-500">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export const authInputClass =
  "w-full rounded-xl border border-olive-200 bg-white px-3 py-2.5 text-olive-900 placeholder:text-olive-400 focus:border-olive-500 focus:outline-none focus:ring-2 focus:ring-olive-200 transition-shadow";

export const authLabelClass = "mb-1.5 block text-sm font-medium text-olive-700";
