import { z } from "zod";

export const serviceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().default(""),
  price: z.number().int().min(0),
  discountPrice: z.number().int().min(0).optional().nullable(),
  duration: z.string().default(""),
});

export const videoSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  url: z.string().min(1),
  earnings: z.number().int().min(0).default(0),
});

export const creatorBodySchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).optional(),
  avatar: z.string().min(1),
  coverImage: z.string().min(1),
  category: z.string().min(1),
  city: z.string().min(1),
  location: z.string().default(""),
  bio: z.string().default(""),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  completedBookings: z.number().int().min(0).optional(),
  rank: z.number().int().min(0).optional(),
  isSubscribed: z.boolean().optional(),
  subscriptionTier: z.enum(["free", "pro", "premium"]).optional(),
  whatsapp: z.string().default(""),
  tags: z.array(z.string()).default([]),
  services: z.array(serviceSchema).default([]),
  videos: z.array(videoSchema).default([]),
});

export const registerSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  category: z.string().min(1),
  city: z.string().min(1),
  bio: z.string().default(""),
  whatsapp: z.string().default(""),
  avatar: z.string().min(1),
  videos: z.array(videoSchema).default([]),
  services: z.array(serviceSchema).default([]),
});

export const bookingSchema = z.object({
  creatorId: z.string().min(1),
  creatorName: z.string().min(1),
  serviceId: z.string().min(1),
  serviceName: z.string().min(1),
  price: z.number().int().min(0),
  date: z.string().min(1),
  time: z.string().min(1),
  clientName: z.string().min(1),
  clientPhone: z.string().min(1),
  notes: z.string().default(""),
});

export const siteContentSchema = z.object({
  brand: z
    .object({
      logoPrimary: z.string().min(1),
      logoSecondary: z.string().min(1),
    })
    .optional(),
  meta: z
    .object({
      title: z.string().min(1),
      description: z.string().min(1),
    })
    .optional(),
  header: z
    .object({
      navBrowse: z.string().min(1),
      navMessages: z.string().min(1),
      navBookings: z.string().min(1),
      signInLabel: z.string().min(1),
      registerLabel: z.string().min(1),
      signOutLabel: z.string().min(1),
    })
    .optional(),
  hero: z
    .object({
      eyebrow: z.string().min(1),
      headlineWords: z.array(z.string().min(1)).min(1),
      subtitle: z.string().min(1),
    })
    .optional(),
  search: z
    .object({
      placeholder: z.string().min(1),
    })
    .optional(),
  empty: z
    .object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
    })
    .optional(),
  creatorCta: z
    .object({
      title: z.string().min(1),
      body: z.string().min(1),
      primaryLabel: z.string().min(1),
      primaryHref: z.string().min(1),
      secondaryLabel: z.string().min(1),
      secondaryHref: z.string().min(1),
    })
    .optional(),
});
