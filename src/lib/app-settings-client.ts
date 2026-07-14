import { apiGet, apiSend } from "@/lib/api-client";
import { AppSettings, defaultAppSettings } from "@/lib/app-settings";

export async function fetchAppSettings(): Promise<AppSettings> {
  try {
    const data = await apiGet<{ settings: AppSettings }>("/api/settings");
    return data.settings;
  } catch {
    return defaultAppSettings;
  }
}

export async function updateAppSettings(
  settings: AppSettings
): Promise<AppSettings> {
  const data = await apiSend<{ settings: AppSettings }>(
    "/api/settings",
    "PUT",
    settings
  );
  return data.settings;
}
