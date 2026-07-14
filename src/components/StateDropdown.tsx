"use client";

import { SelectDropdown } from "@/components/SelectDropdown";
import { nigeriaStates } from "@/lib/nigeria-states";

const stateOptions = [
  { value: "All", label: "All States" },
  ...nigeriaStates.map((s) => ({ value: s, label: s })),
];

interface StateDropdownProps {
  value: string;
  onChange: (value: string) => void;
  includeAll?: boolean;
  className?: string;
  id?: string;
}

export function StateDropdown({
  value,
  onChange,
  includeAll = false,
  className = "",
  id,
}: StateDropdownProps) {
  const options = includeAll
    ? stateOptions
    : nigeriaStates.map((s) => ({ value: s, label: s }));

  return (
    <SelectDropdown
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select state"
      className={className}
    />
  );
}
