export interface SiteContent {
  brand: {
    logoPrimary: string;
    logoSecondary: string;
  };
  meta: {
    title: string;
    description: string;
  };
  header: {
    navBrowse: string;
    navMessages: string;
    navBookings: string;
    signInLabel: string;
    registerLabel: string;
    signOutLabel: string;
  };
  hero: {
    eyebrow: string;
    headlineWords: string[];
    subtitle: string;
  };
  search: {
    placeholder: string;
  };
  empty: {
    title: string;
    subtitle: string;
  };
  creatorCta: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
}

export const defaultSiteContent: SiteContent = {
  brand: {
    logoPrimary: "UpNext",
    logoSecondary: "Creators",
  },
  meta: {
    title: "UpNext Creators | Discover, Book & Connect with Creators",
    description:
      "Nigeria's creator marketplace. Discover, book, and connect with top photographers, musicians, makeup artists, designers, and more.",
  },
  header: {
    navBrowse: "Browse",
    navMessages: "Messages",
    navBookings: "Bookings",
    signInLabel: "Sign In",
    registerLabel: "Register",
    signOutLabel: "Sign Out",
  },
  hero: {
    eyebrow: "Nigeria's Creator Marketplace",
    headlineWords: ["Discover", "Top", "Creators"],
    subtitle:
      "Book photographers, musicians, makeup artists, designers, and more — ranked, verified, and ready to bring your vision to life, wherever you are.",
  },
  search: {
    placeholder: "Search creators, categories, or states...",
  },
  empty: {
    title: "No creators found.",
    subtitle: "Try adjusting your search or filters.",
  },
  creatorCta: {
    title: "Are you a creator?",
    body: "Join UpNext Creators — register your profile, pick your category, upload your best work, and get discovered nationwide.",
    primaryLabel: "Register as Creator",
    primaryHref: "/register",
    secondaryLabel: "Sign In",
    secondaryHref: "/signin",
  },
};

export function mergeSiteContent(partial: unknown): SiteContent {
  const incoming =
    partial && typeof partial === "object" ? (partial as Partial<SiteContent>) : {};
  return {
    brand: { ...defaultSiteContent.brand, ...incoming.brand },
    meta: { ...defaultSiteContent.meta, ...incoming.meta },
    header: { ...defaultSiteContent.header, ...incoming.header },
    hero: {
      ...defaultSiteContent.hero,
      ...incoming.hero,
      headlineWords:
        incoming.hero?.headlineWords?.length
          ? incoming.hero.headlineWords
          : defaultSiteContent.hero.headlineWords,
    },
    search: { ...defaultSiteContent.search, ...incoming.search },
    empty: { ...defaultSiteContent.empty, ...incoming.empty },
    creatorCta: { ...defaultSiteContent.creatorCta, ...incoming.creatorCta },
  };
}
