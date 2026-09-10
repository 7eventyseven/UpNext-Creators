const ADMIN_SESSION_KEY = "upnext_admin_session";
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

export function isAdminLoggedIn(): boolean {
  return safeGet(ADMIN_SESSION_KEY) === "authenticated";
}

export async function adminLogin(password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      safeSet(ADMIN_SESSION_KEY, "authenticated");
      return true;
    }

    // Fallback for first boot before seed
    if (password === DEFAULT_PASSWORD) {
      safeSet(ADMIN_SESSION_KEY, "authenticated");
      return true;
    }
    return false;
  } catch {
    if (password === DEFAULT_PASSWORD) {
      safeSet(ADMIN_SESSION_KEY, "authenticated");
      return true;
    }
    return false;
  }
}

export function adminLogout() {
  safeRemove(ADMIN_SESSION_KEY);
}
