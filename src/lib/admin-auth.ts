const ADMIN_SESSION_KEY = "upnext_admin_session";
const ADMIN_PASSWORD_KEY = "upnext_admin_password";
const DEFAULT_PASSWORD = "upnext2024";

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function safeSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

export function getAdminPassword(): string {
  return safeGet(ADMIN_PASSWORD_KEY) ?? DEFAULT_PASSWORD;
}

export function setAdminPassword(password: string) {
  safeSet(ADMIN_PASSWORD_KEY, password);
}

export function isAdminLoggedIn(): boolean {
  return safeGet(ADMIN_SESSION_KEY) === "authenticated";
}

export function adminLogin(password: string): boolean {
  if (password === getAdminPassword()) {
    safeSet(ADMIN_SESSION_KEY, "authenticated");
    return true;
  }
  return false;
}

export function adminLogout() {
  safeRemove(ADMIN_SESSION_KEY);
}
