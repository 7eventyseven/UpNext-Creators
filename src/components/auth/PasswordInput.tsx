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
        type={visible ? "text" : "password"}
        disabled={disabled}
        className={
          className ??
          `${authInputClass} ${showLockIcon ? "pl-10" : ""} pr-10`
        }
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-olive-400 hover:text-olive-600 transition-colors disabled:opacity-50"
        aria-label={visible ? "Hide password" : "Show password"}
        disabled={disabled}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
