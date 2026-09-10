import { PrismaClient } from "@prisma/client";
import { seedCreators } from "../src/data/seed-creators";

const prisma = new PrismaClient();

const defaultCategories = [
  "Photography",
  "Music Production",
  "Makeup & Beauty",
  "Videography",
  "Graphic Design",
  "Content Creation",
  "Fashion & Styling",
  "Writing & Copy",
];

async function main() {
  console.log("Seeding database...");

  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.creatorAccount.deleteMany();
  await prisma.creatorVideo.deleteMany();
  await prisma.service.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.category.deleteMany();
  await prisma.adminSetting.deleteMany();

  await prisma.adminSetting.create({
    data: { id: "admin", password: "upnext2024" },
  });

  for (const name of defaultCategories) {
    await prisma.category.create({ data: { name } });
  }

  for (const creator of seedCreators) {
    await prisma.creator.create({
      data: {
        id: creator.id,
        name: creator.name,
        username: creator.username,
        email: creator.email ?? null,
        avatar: creator.avatar,
        coverImage: creator.coverImage,
        category: creator.category,
        city: creator.city,
        location: creator.location,
        bio: creator.bio,
        rating: creator.rating,
        reviewCount: creator.reviewCount,
        completedBookings: creator.completedBookings,
        rank: creator.rank,
        isSubscribed: creator.isSubscribed,
        subscriptionTier: creator.subscriptionTier,
        whatsapp: creator.whatsapp,
        tags: JSON.stringify(creator.tags),
        services: {
          create: creator.services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            discountPrice: s.discountPrice ?? null,
            duration: s.duration,
          })),
        },
        videos: {
          create: (creator.videos ?? []).map((v) => ({
            id: v.id,
            title: v.title,
            url: v.url,
            earnings: v.earnings,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${seedCreators.length} creators and ${defaultCategories.length} categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
