import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "UpNext Creators",
    short_name: "UpNext",
    description:
      "Nigeria's creator marketplace. Discover, book, and connect with top photographers, musicians, makeup artists, designers, and more.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "browser"],
    background_color: "#FAF7F2",
    theme_color: "#556B2F",
    orientation: "portrait-primary",
    lang: "en",
    dir: "ltr",
    categories: ["business", "lifestyle", "shopping", "social"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-256x256.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/monochrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "monochrome",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Browse creators on desktop",
      },
      {
        src: "/screenshots/narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Browse creators on mobile",
      },
    ],
    shortcuts: [
      {
        name: "Browse Creators",
        short_name: "Browse",
        description: "Discover creators across Nigeria",
        url: "/",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "My Bookings",
        short_name: "Bookings",
        description: "View your service bookings",
        url: "/bookings",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Creator Dashboard",
        short_name: "Dashboard",
        description: "Manage your creator profile",
        url: "/dashboard",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
      {
        name: "Go Pro",
        short_name: "Subscribe",
        description: "Boost your visibility",
        url: "/subscribe",
        icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }],
      },
    ],
  };
}
