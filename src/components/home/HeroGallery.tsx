import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";

type DriftStyle = CSSProperties & {
  "--drift-x": string;
  "--drift-y": string;
  "--sway": string;
};

const HERO_IMAGES = [
  {
    src: "/images/photography.png",
    alt: "Photographer framing a shot at dusk",
    position: "left-0 top-[8%] z-[1] h-[84%] w-[36%]",
    frame: "rounded-[1.6rem] shadow-[0_24px_50px_rgba(47,58,28,0.18)]",
    tilt: -8,
    duration: "9s",
    delay: "0s",
    drift: { "--drift-x": "10px", "--drift-y": "-18px", "--sway": "1.8deg" },
  },
  {
    src: "/images/beauty-portrait.png",
    alt: "Beauty portrait of a model",
    position: "left-[30%] top-0 z-[2] h-[90%] w-[38%]",
    frame: "rounded-[1.6rem] shadow-[0_28px_55px_rgba(47,58,28,0.2)]",
    tilt: 0,
    duration: "11s",
    delay: "-1.5s",
    drift: { "--drift-x": "-8px", "--drift-y": "-14px", "--sway": "-1.4deg" },
  },
  {
    src: "/images/makeup-palette.png",
    alt: "Makeup artist loading a brush from a palette",
    position: "right-[8%] top-[2%] z-[1] h-[70%] w-[30%]",
    frame: "rounded-[1.5rem] shadow-[0_24px_50px_rgba(47,58,28,0.16)]",
    tilt: 8,
    duration: "8.5s",
    delay: "-3s",
    drift: { "--drift-x": "12px", "--drift-y": "-20px", "--sway": "2.2deg" },
  },
  {
    src: "/images/silhouette.png",
    alt: "Silhouette of a makeup artist at work",
    position: "bottom-[2%] right-[-2%] z-[3] h-[36%] w-[26%]",
    frame: "rounded-[1.15rem] shadow-[0_18px_40px_rgba(47,58,28,0.16)]",
    tilt: 7,
    duration: "7.5s",
    delay: "-2s",
    drift: { "--drift-x": "-14px", "--drift-y": "-12px", "--sway": "-2.4deg" },
  },
];

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&q=80",
];

export function HeroGallery() {
  return (
    <div className="relative mx-auto h-[300px] w-full max-w-[520px] lg:h-[390px] lg:max-w-none">
      {HERO_IMAGES.map((image) => (
        <div
          key={image.src}
          className={`absolute ${image.position} transition-transform duration-500 ease-out hover:z-[6] hover:scale-[1.04]`}
        >
          <div
            className="hero-drift h-full w-full"
            style={
              {
                ...image.drift,
                animationDuration: image.duration,
                animationDelay: image.delay,
              } as DriftStyle
            }
          >
            <div
              className={`hero-sway relative h-full w-full overflow-hidden bg-olive-100 ${image.frame}`}
              style={
                {
                  ...image.drift,
                  rotate: `${image.tilt}deg`,
                  animationDuration: image.duration,
                  animationDelay: image.delay,
                } as DriftStyle
              }
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 1024px) 50vw, 280px"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      ))}

      <div className="pointer-events-none absolute right-0 top-5 z-[4] hidden flex-col items-end gap-1 text-[8px] font-medium uppercase leading-none tracking-[0.22em] text-olive-500/70 xl:flex">
        <span>Photography</span>
        <span>Videography</span>
        <span>Design</span>
        <span>Music</span>
        <span>And more</span>
      </div>

      <div
        className="hero-drift absolute bottom-[14%] left-[18%] z-[5]"
        style={
          {
            "--drift-x": "6px",
            "--drift-y": "-10px",
            "--sway": "0deg",
            animationDuration: "6.5s",
            animationDelay: "-1s",
          } as DriftStyle
        }
      >
        <Link
          href="/explore"
          className="flex items-center gap-3 rounded-full bg-[#2f3a1c] py-1.5 pl-1.5 pr-1.5 text-milky-50 shadow-[0_16px_40px_rgba(47,58,28,0.28)] transition-transform hover:-translate-y-0.5"
        >
          <span className="flex -space-x-2 pl-1">
            {AVATARS.map((src) => (
              <span
                key={src}
                className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-[#2f3a1c]"
              >
                <Image src={src} alt="" fill sizes="32px" className="object-cover" />
              </span>
            ))}
          </span>
          <span className="pr-1 leading-tight">
            <span className="block text-[13px] font-semibold">Talented creatives</span>
            <span className="block text-[11px] text-olive-100/80">
              Ready for your next project
            </span>
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-olive-700/80">
            <ChevronRight size={16} />
          </span>
        </Link>
      </div>
    </div>
  );
}
