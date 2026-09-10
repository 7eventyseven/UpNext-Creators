import { apiGet, apiSend } from "@/lib/api-client";
import { defaultSiteContent, SiteContent } from "@/lib/site-content";

export async function fetchSiteContent(): Promise<SiteContent> {
  try {
    const data = await apiGet<{ content: SiteContent }>("/api/site-content");
    return data.content;
  } catch {
    return defaultSiteContent;
  }
}

export async function updateSiteContent(
  content: SiteContent
): Promise<SiteContent> {
  const data = await apiSend<{ content: SiteContent }>(
    "/api/site-content",
    "PUT",
    content
  );
  return data.content;
}

export async function resetSiteContent(): Promise<SiteContent> {
  const data = await apiSend<{ content: SiteContent }>("/api/site-content", "POST", {
    action: "reset",
  });
  return data.content;
}
