"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { authInputClass } from "./AuthSection";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showLockIcon?: boolean;
}

export function PasswordInput({
  showLockIcon = false,
  className,
  disabled,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      {showLockIcon && (
        <Lock
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-olive-400 pointer-events-none"
        />
      )}
      <input
        {...props}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={
          className ??
          `${authInputClass} ${showLockIcon ? "pl-10" : ""} pr-11`
        }
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-olive-500 transition-colors hover:bg-olive-100 hover:text-olive-800 disabled:opacity-50"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        disabled={disabled}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
