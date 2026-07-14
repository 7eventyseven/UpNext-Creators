import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(process.cwd(), "public", "icons");
const SPLASH = join(process.cwd(), "public", "splash");
const SCREENSHOTS = join(process.cwd(), "public", "screenshots");

mkdirSync(OUT, { recursive: true });
mkdirSync(SPLASH, { recursive: true });
mkdirSync(SCREENSHOTS, { recursive: true });

const MILKY = "#FAF7F2";
const OLIVE = "#556B2F";
const OLIVE_DARK = "#3D4F22";

function logoSvg(size, maskable = false) {
  const pad = maskable ? size * 0.2 : 0;
  const inner = size - pad * 2;
  const barW = Math.max(Math.round(inner * (7 / 32)), 2);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${MILKY}"/>
  <rect x="${pad}" y="${pad}" width="${barW}" height="${inner}" fill="${OLIVE}"/>
</svg>`;
}

function monoSvg(size) {
  const barW = Math.max(Math.round(size * (7 / 32)), 2);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#000000" fill-opacity="0"/>
  <rect width="${barW}" height="${size}" fill="#FFFFFF"/>
</svg>`;
}

async function pngFromSvg(svg, size, file) {
  const buf = await sharp(Buffer.from(svg)).resize(size, size).png().toFile(file);
  return buf;
}

const iconSizes = [72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512, 1024];

for (const size of iconSizes) {
  await pngFromSvg(logoSvg(size), size, join(OUT, `icon-${size}x${size}.png`));
  await pngFromSvg(
    logoSvg(size, true),
    size,
    join(OUT, `maskable-${size}x${size}.png`)
  );
  await pngFromSvg(logoSvg(size), size, join(OUT, `apple-${size}x${size}.png`));
}

await pngFromSvg(monoSvg(512), 512, join(OUT, "monochrome-512x512.png"));
await pngFromSvg(logoSvg(32), 32, join(OUT, "favicon-32x32.png"));
await pngFromSvg(logoSvg(16), 16, join(OUT, "favicon-16x16.png"));

// Favicon.ico (multi-size via 32px png copy as ico-compatible png fallback)
await sharp(Buffer.from(logoSvg(32))).resize(32, 32).png().toFile(join(process.cwd(), "public", "favicon.ico"));

const splashSizes = [
  ["iphone-se", 640, 1136],
  ["iphone-8", 750, 1334],
  ["iphone-11", 828, 1792],
  ["iphone-11-pro", 1125, 2436],
  ["iphone-12", 1170, 2532],
  ["iphone-14-pro-max", 1290, 2796],
  ["ipad", 1536, 2048],
  ["ipad-pro", 2048, 2732],
];

for (const [name, w, h] of splashSizes) {
  const logo = Math.round(Math.min(w, h) * 0.18);
  const barW = Math.max(Math.round(logo * (7 / 32)), 4);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${MILKY}"/>
  <rect x="${(w - logo) / 2}" y="${(h - logo) / 2}" width="${logo}" height="${logo}" fill="${MILKY}"/>
  <rect x="${(w - logo) / 2}" y="${(h - logo) / 2}" width="${barW}" height="${logo}" fill="${OLIVE}"/>
  <text x="${w / 2}" y="${(h + logo) / 2 + 64}" text-anchor="middle" font-family="Georgia, serif" font-size="${Math.round(logo * 0.28)}" fill="${OLIVE_DARK}">UpNext</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(SPLASH, `${name}.png`));
}

async function screenshot(name, w, h, label) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${MILKY}"/>
      <stop offset="100%" stop-color="#E8E4D9"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect x="0" y="0" width="24" height="${h}" fill="${OLIVE}"/>
  <text x="${w / 2}" y="${h / 2 - 20}" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="700" fill="${OLIVE_DARK}">UpNext Creators</text>
  <text x="${w / 2}" y="${h / 2 + 40}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="32" fill="${OLIVE}">${label}</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(SCREENSHOTS, name));
}

await screenshot("wide.png", 1280, 720, "Discover and book top creators");
await screenshot("narrow.png", 750, 1334, "Nigeria creator marketplace");

writeFileSync(
  join(OUT, "README.txt"),
  "Generated PWA icons for UpNext Creators. Run: npx tsx scripts/generate-pwa-icons.ts\n"
);

console.log("PWA icons, splash screens, and screenshots generated.");
