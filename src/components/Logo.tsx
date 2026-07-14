interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "mark" | "wordmark";
  className?: string;
}

const sizes = {
  sm: { title: "text-[15px]", sub: "text-[8px] mt-px", bar: "border-l-[2.5px] pl-2" },
  md: { title: "text-[17px]", sub: "text-[9px] mt-0.5", bar: "border-l-[3px] pl-2.5" },
  lg: { title: "text-xl", sub: "text-[10px] mt-1", bar: "border-l-[3px] pl-3" },
};

export function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const s = sizes[size];

  if (variant === "mark") {
    return (
      <svg
        width={28}
        height={28}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden
      >
        <rect width="28" height="28" fill="#FAF7F2" />
        <rect width="5" height="28" fill="#556B2F" />
      </svg>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className={`flex flex-col justify-center ${s.bar} border-olive-600 ${className}`}>
        <span
          className={`${s.title} font-bold tracking-[-0.04em] text-olive-900 leading-none`}
        >
          UpNext
        </span>
        <span
          className={`${s.sub} font-medium tracking-[0.18em] text-olive-500 uppercase leading-none`}
        >
          Creators
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex flex-col justify-center ${s.bar} border-olive-600`}>
        <span
          className={`${s.title} font-bold tracking-[-0.04em] text-olive-900 leading-none`}
        >
          UpNext
        </span>
        <span
          className={`${s.sub} font-medium tracking-[0.18em] text-olive-500 uppercase leading-none`}
        >
          Creators
        </span>
      </div>
    </div>
  );
}
