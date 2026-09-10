"use client";

import { AppSettings } from "@/lib/app-settings";

export function MaintenanceNotice({
  settings,
}: {
  settings: Pick<AppSettings, "maintenanceMode" | "maintenanceMessage">;
}) {
  if (!settings.maintenanceMode) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold">Maintenance mode</p>
      <p className="mt-1 leading-relaxed">{settings.maintenanceMessage}</p>
    </div>
  );
}
