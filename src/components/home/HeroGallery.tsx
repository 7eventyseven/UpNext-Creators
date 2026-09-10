import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const HERO_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80",
    alt: "Photographer at work",
    className:
      "absolute left-0 top-[8%] z-[1] h-[84%] w-[36%] -rotate-[8deg] overflow-hidden rounded-[1.6rem] bg-olive-100 shadow-[0_24px_50px_rgba(47,58,28,0.18)]",
  },
  {
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
    alt: "Portrait of a creative",
    className:
      "absolute left-[30%] top-0 z-[2] h-[90%] w-[38%] overflow-hidden rounded-[1.6rem] bg-olive-100 shadow-[0_28px_55px_rgba(47,58,28,0.2)]",
  },
  {
    src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=800&q=80",
    alt: "Live music performance",
    className:
      "absolute right-[8%] top-[2%] z-[1] h-[70%] w-[30%] rotate-[8deg] overflow-hidden rounded-[1.5rem] bg-olive-100 shadow-[0_24px_50px_rgba(47,58,28,0.16)]",
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    alt: "Designer working on a laptop",
    className:
      "absolute bottom-[2%] right-[-2%] z-[3] h-[36%] w-[26%] rotate-[7deg] overflow-hidden rounded-[1.15rem] bg-olive-100 shadow-[0_18px_40px_rgba(47,58,28,0.16)]",
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
        <div key={image.src} className={image.className}>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 1024px) 50vw, 280px"
            className="object-cover"
            priority
          />
        </div>
      ))}

      <div className="pointer-events-none absolute right-0 top-5 z-[4] hidden flex-col items-end gap-1 text-[8px] font-medium uppercase leading-none tracking-[0.22em] text-olive-500/70 xl:flex">
        <span>Photography</span>
        <span>Videography</span>
        <span>Design</span>
        <span>Music</span>
        <span>And more</span>
      </div>

      <Link
        href="/explore"
        className="absolute bottom-[14%] left-[18%] z-[5] flex items-center gap-3 rounded-full bg-[#2f3a1c] py-1.5 pl-1.5 pr-1.5 text-milky-50 shadow-[0_16px_40px_rgba(47,58,28,0.28)] transition-transform hover:-translate-y-0.5"
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
  );
}
