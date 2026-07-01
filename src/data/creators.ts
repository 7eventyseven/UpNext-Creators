import { Creator } from "@/types";

export const creators: Creator[] = [
  {
    id: "1",
    name: "Amina Ibrahim",
    username: "aminacreates",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Amina",
    coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
    category: "Photography",
    location: "Jos, Plateau State",
    bio: "Capturing the beauty of Jos Plateau — weddings, portraits, and lifestyle shoots with a natural, warm aesthetic.",
    rating: 4.9,
    reviewCount: 127,
    completedBookings: 340,
    rank: 1,
    isSubscribed: true,
    subscriptionTier: "premium",
    whatsapp: "2348034567890",
    tags: ["Wedding", "Portrait", "Events"],
    services: [
      {
        id: "s1",
        name: "Wedding Photography",
        description: "Full-day coverage with edited gallery delivery",
        price: 150000,
        discountPrice: 120000,
        duration: "8 hours",
      },
      {
        id: "s2",
        name: "Portrait Session",
        description: "Studio or outdoor portrait shoot",
        price: 35000,
        duration: "2 hours",
      },
      {
        id: "s3",
        name: "Event Coverage",
        description: "Birthdays, corporate events, and celebrations",
        price: 80000,
        discountPrice: 65000,
        duration: "4 hours",
      },
    ],
  },
  {
    id: "2",
    name: "David Okafor",
    username: "davidbeats",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=David",
    coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    category: "Music Production",
    location: "Rayfield, Jos",
    bio: "Producer and sound engineer based in Jos. Afrobeats, gospel, and film scoring. Let's make your sound unforgettable.",
    rating: 4.8,
    reviewCount: 89,
    completedBookings: 210,
    rank: 2,
    isSubscribed: true,
    subscriptionTier: "pro",
    whatsapp: "2348098765432",
    tags: ["Afrobeats", "Mixing", "Mastering"],
    services: [
      {
        id: "s4",
        name: "Beat Production",
        description: "Custom beat tailored to your style",
        price: 50000,
        discountPrice: 40000,
        duration: "3-5 days",
      },
      {
        id: "s5",
        name: "Mixing & Mastering",
        description: "Professional mix and master for release-ready tracks",
        price: 25000,
        duration: "2-3 days",
      },
      {
        id: "s6",
        name: "Full Song Production",
        description: "Beat, recording, mixing, and mastering package",
        price: 120000,
        duration: "1-2 weeks",
      },
    ],
  },
  {
    id: "3",
    name: "Grace Pam",
    username: "graceglam",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Grace",
    coverImage: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
    category: "Makeup & Beauty",
    location: "Bukuru, Jos",
    bio: "Bridal and glam makeup artist serving Jos and environs. Soft glam, bold looks, and everything in between.",
    rating: 4.7,
    reviewCount: 156,
    completedBookings: 420,
    rank: 3,
    isSubscribed: true,
    subscriptionTier: "pro",
    whatsapp: "2347012345678",
    tags: ["Bridal", "Glam", "Editorial"],
    services: [
      {
        id: "s7",
        name: "Bridal Makeup",
        description: "Full bridal glam with trial session",
        price: 45000,
        discountPrice: 38000,
        duration: "3 hours",
      },
      {
        id: "s8",
        name: "Party Glam",
        description: "Event-ready makeup look",
        price: 15000,
        duration: "1 hour",
      },
      {
        id: "s9",
        name: "Bridal Party Package",
        description: "Makeup for bride + 4 bridesmaids",
        price: 120000,
        discountPrice: 100000,
        duration: "Full day",
      },
    ],
  },
  {
    id: "4",
    name: "Emmanuel Danjuma",
    username: "emmanuelvid",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Emmanuel",
    coverImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
    category: "Videography",
    location: "Jos Township",
    bio: "Cinematic videographer specializing in documentaries, music videos, and brand content across Plateau State.",
    rating: 4.6,
    reviewCount: 72,
    completedBookings: 185,
    rank: 4,
    isSubscribed: false,
    subscriptionTier: "free",
    whatsapp: "2348123456789",
    tags: ["Music Videos", "Documentary", "Brand"],
    services: [
      {
        id: "s10",
        name: "Music Video",
        description: "Concept to final edit music video production",
        price: 200000,
        discountPrice: 170000,
        duration: "1-2 weeks",
      },
      {
        id: "s11",
        name: "Event Videography",
        description: "Highlight reel and full event coverage",
        price: 90000,
        duration: "1 day",
      },
      {
        id: "s12",
        name: "Brand Commercial",
        description: "Short-form ad or promo video",
        price: 150000,
        duration: "1 week",
      },
    ],
  },
  {
    id: "5",
    name: "Blessing Akila",
    username: "blessingdesigns",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=Blessing",
    coverImage: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    category: "Graphic Design",
    location: "Anglo Jos",
    bio: "Brand identity, social media graphics, and print design for businesses and creators on the Plateau.",
    rating: 4.5,
    reviewCount: 64,
    completedBookings: 150,
    rank: 5,
    isSubscribed: false,
    subscriptionTier: "free",
    whatsapp: "2349076543210",
    tags: ["Branding", "Social Media", "Print"],
    services: [
      {
        id: "s13",
        name: "Logo & Brand Identity",
        description: "Logo, color palette, and brand guidelines",
        price: 60000,
        discountPrice: 50000,
        duration: "5-7 days",
      },
      {
        id: "s14",
        name: "Social Media Pack",
        description: "10 custom graphics for your social channels",
        price: 20000,
        duration: "3 days",
      },
      {
        id: "s15",
        name: "Flyer & Poster Design",
        description: "Event or promotional print design",
        price: 10000,
        duration: "1-2 days",
      },
    ],
  },
  {
    id: "6",
    name: "John Musa",
    username: "johnmua",
    avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=John",
    coverImage: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80",
    category: "Content Creation",
    location: "Jos, Plateau State",
    bio: "UGC creator and social media strategist helping brands tell their story through authentic Plateau content.",
    rating: 4.4,
    reviewCount: 38,
    completedBookings: 95,
    rank: 6,
    isSubscribed: false,
    subscriptionTier: "free",
    whatsapp: "2348065432109",
    tags: ["UGC", "TikTok", "Instagram"],
    services: [
      {
        id: "s16",
        name: "UGC Video Package",
        description: "3 short-form videos for your brand",
        price: 45000,
        discountPrice: 35000,
        duration: "5 days",
      },
      {
        id: "s17",
        name: "Social Media Management",
        description: "Monthly content planning and posting",
        price: 80000,
        duration: "1 month",
      },
      {
        id: "s18",
        name: "Brand Ambassador Campaign",
        description: "2-week dedicated brand promotion",
        price: 100000,
        duration: "2 weeks",
      },
    ],
  },
];

export function getCreatorById(id: string): Creator | undefined {
  return creators.find((c) => c.id === id);
}

export function getSortedCreators(): Creator[] {
  return [...creators].sort((a, b) => {
    if (a.isSubscribed !== b.isSubscribed) return a.isSubscribed ? -1 : 1;
    if (a.subscriptionTier !== b.subscriptionTier) {
      const tierOrder = { premium: 0, pro: 1, free: 2 };
      return tierOrder[a.subscriptionTier] - tierOrder[b.subscriptionTier];
    }
    return a.rank - b.rank;
  });
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${cleanPhone}${encodedMessage}`;
}

export function getDiscountPercent(price: number, discountPrice: number): number {
  return Math.round(((price - discountPrice) / price) * 100);
}
