export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const DISMISS_KEY = "upnext-pwa-install-dismissed";
const INTERACTION_KEY = "upnext-pwa-meaningful-interaction";

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  const twa = document.referrer.startsWith("android-app://");
  return mq || iosStandalone || twa;
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const iPadOs13 =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iphone|ipad|ipod/.test(ua) || iPadOs13;
}

export function isSafariBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios|android/.test(ua);
  return isSafari;
}

export function wasInstallDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function markMeaningfulInteraction(): void {
  try {
    localStorage.setItem(INTERACTION_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function hadMeaningfulInteraction(): boolean {
  try {
    return localStorage.getItem(INTERACTION_KEY) === "1";
  } catch {
    return false;
  }
}
