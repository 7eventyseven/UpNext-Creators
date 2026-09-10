"use client";

import { useEffect, useState } from "react";
import { Download, Share, PlusSquare, X, Smartphone } from "lucide-react";
import {
  BeforeInstallPromptEvent,
  dismissInstallPrompt,
  hadMeaningfulInteraction,
  isIosDevice,
  isSafariBrowser,
  isStandaloneDisplay,
  markMeaningfulInteraction,
  wasInstallDismissed,
} from "@/lib/pwa";

type PromptMode = "chromium" | "ios" | null;

export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [mode, setMode] = useState<PromptMode>(null);
  const [open, setOpen] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay() || wasInstallDismissed()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setMode("chromium");
      if (hadMeaningfulInteraction()) {
        setOpen(true);
      }
    };

    const onInstalled = () => {
      setOpen(false);
      setDeferred(null);
      dismissInstallPrompt();
    };

    const markInteraction = () => {
      markMeaningfulInteraction();
      if (deferred || (isIosDevice() && isSafariBrowser())) {
        setOpen(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("pointerdown", markInteraction, { once: true });
    window.addEventListener("keydown", markInteraction, { once: true });

    if (isIosDevice() && isSafariBrowser() && !isStandaloneDisplay()) {
      setMode("ios");
      const timer = window.setTimeout(() => {
        if (hadMeaningfulInteraction() || document.visibilityState === "visible") {
          setOpen(true);
        }
      }, 1800);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
        window.removeEventListener("pointerdown", markInteraction);
        window.removeEventListener("keydown", markInteraction);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("keydown", markInteraction);
    };
  }, [deferred]);

  useEffect(() => {
    if (!deferred || wasInstallDismissed() || isStandaloneDisplay()) return;
    if (hadMeaningfulInteraction()) setOpen(true);
  }, [deferred]);

  if (!open || !mode || isStandaloneDisplay()) return null;

  const close = () => {
    setOpen(false);
    dismissInstallPrompt();
  };

  const install = async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        dismissInstallPrompt();
        setOpen(false);
      }
    } finally {
      setInstalling(false);
      setDeferred(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-olive-950/40 backdrop-blur-sm animate-fade-in"
        aria-label="Dismiss install prompt"
        onClick={close}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/40 bg-milky-50/85 shadow-2xl backdrop-blur-xl animate-slide-up dark:border-olive-700/40 dark:bg-olive-950/85">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-olive-400 via-olive-600 to-olive-800" />

        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-96x96.png"
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl border border-olive-200/70 shadow-sm"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-olive-500 dark:text-olive-300">
                Install app
              </p>
              <h2
                id="pwa-install-title"
                className="text-lg font-bold text-olive-900 dark:text-milky-50"
              >
                UpNext Creators
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-olive-500 hover:bg-olive-100/80 dark:hover:bg-olive-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm leading-relaxed text-olive-700 dark:text-olive-200">
            Get faster access, a full-screen experience, and an icon on your
            home screen or desktop.
          </p>

          {mode === "chromium" ? (
            <button
              type="button"
              onClick={install}
              disabled={installing}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-olive-600 px-4 py-3.5 text-sm font-semibold text-milky-50 shadow-lg shadow-olive-900/10 hover:bg-olive-700 disabled:opacity-60"
            >
              <Download size={18} />
              {installing ? "Opening install…" : "Install UpNext"}
            </button>
          ) : (
            <ol className="space-y-3 text-sm text-olive-800 dark:text-olive-100">
              <li className="flex items-start gap-3 rounded-2xl bg-white/60 dark:bg-olive-900/50 px-3.5 py-3 border border-olive-100/80 dark:border-olive-700/50">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-olive-600 text-xs font-bold text-milky-50">
                  1
                </span>
                <div>
                  <p className="font-semibold">Tap Share</p>
                  <p className="mt-0.5 text-olive-600 dark:text-olive-300 inline-flex items-center gap-1.5">
                    The <Share size={14} aria-hidden /> button at the bottom of
                    Safari
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-2xl bg-white/60 dark:bg-olive-900/50 px-3.5 py-3 border border-olive-100/80 dark:border-olive-700/50">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-olive-600 text-xs font-bold text-milky-50">
                  2
                </span>
                <div>
                  <p className="font-semibold">Add to Home Screen</p>
                  <p className="mt-0.5 text-olive-600 dark:text-olive-300 inline-flex items-center gap-1.5">
                    Choose <PlusSquare size={14} aria-hidden /> Add to Home
                    Screen
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-2xl bg-white/60 dark:bg-olive-900/50 px-3.5 py-3 border border-olive-100/80 dark:border-olive-700/50">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-olive-600 text-xs font-bold text-milky-50">
                  3
                </span>
                <div>
                  <p className="font-semibold">Tap Add</p>
                  <p className="mt-0.5 text-olive-600 dark:text-olive-300 inline-flex items-center gap-1.5">
                    <Smartphone size={14} aria-hidden /> UpNext appears on your
                    Home Screen
                  </p>
                </div>
              </li>
            </ol>
          )}

          <button
            type="button"
            onClick={close}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-olive-600 hover:bg-olive-100/70 dark:text-olive-300 dark:hover:bg-olive-900"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
