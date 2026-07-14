import { apiGet, apiSend } from "@/lib/api-client";

export async function isAdminLoggedIn(): Promise<boolean> {
  try {
    await apiGet<{ authenticated: boolean }>("/api/auth/admin");
    return true;
  } catch {
    return false;
  }
}

export async function adminLogin(
  password: string,
  email = "nungseplangnan@gmail.com"
): Promise<boolean> {
  try {
    await apiSend("/api/auth/admin", "POST", { password, email });
    return true;
  } catch {
    return false;
  }
}

export async function adminLogout() {
  try {
    await apiSend("/api/auth/admin", "DELETE");
  } catch {
    // ignore
  }
}
