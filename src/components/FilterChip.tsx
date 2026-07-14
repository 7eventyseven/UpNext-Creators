import type { CSSProperties } from "react";

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  index?: number;
}

export function FilterChip({ label, active, onClick, index = 0 }: FilterChipProps) {
  const glideX = index % 2 === 0 ? 8 : -8;

  return (
    <button
      type="button"
      onClick={onClick}
      style={
        {
          animationDelay: `${index * 40}ms`,
          "--glide-x": `${glideX}px`,
        } as CSSProperties
      }
      className={`
        filter-chip shrink-0 animate-fade-in
        ${active ? "filter-chip-active" : "filter-chip-inactive"}
      `}
    >
      {label}
    </button>
  );
}
