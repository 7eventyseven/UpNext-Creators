import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { seedCreators } from "../src/data/seed-creators";
import { defaultCategories } from "../src/lib/categories";
import { defaultSiteContent } from "../src/lib/site-content";
import { defaultAppSettings } from "../src/lib/app-settings";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function id(prefix: string, value?: string) {
  return value ?? `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

async function main() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf8");
  await pool.query(schemaSql);

  const adminEmail =
    process.env.ADMIN_EMAIL || "nungseplangnan@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "William";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await pool.query(
    `INSERT INTO "Admin" (id, email, "passwordHash", "updatedAt")
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (email) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", "updatedAt" = CURRENT_TIMESTAMP`,
    [id("adm"), adminEmail, passwordHash]
  );

  for (const name of defaultCategories) {
    await pool.query(
      `INSERT INTO "Category" (id, name)
       VALUES ($1, $2)
       ON CONFLICT (name) DO NOTHING`,
      [id("cat"), name]
    );
  }

  const categories = await pool.query<{ id: string; name: string }>(
    `SELECT id, name FROM "Category"`
  );
  const categoryByName = Object.fromEntries(
    categories.rows.map((c) => [c.name, c.id])
  );

  for (const creator of seedCreators) {
    const categoryId = categoryByName[creator.category] ?? null;

    await pool.query(
      `INSERT INTO "Creator" (
        id, name, username, avatar, "coverImage", "categoryName", "categoryId",
        city, location, bio, rating, "reviewCount", "completedBookings", rank,
        "isSubscribed", "subscriptionTier", whatsapp, tags, "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        username = EXCLUDED.username,
        avatar = EXCLUDED.avatar,
        "coverImage" = EXCLUDED."coverImage",
        "categoryName" = EXCLUDED."categoryName",
        "categoryId" = EXCLUDED."categoryId",
        city = EXCLUDED.city,
        location = EXCLUDED.location,
        bio = EXCLUDED.bio,
        rating = EXCLUDED.rating,
        "reviewCount" = EXCLUDED."reviewCount",
        "completedBookings" = EXCLUDED."completedBookings",
        rank = EXCLUDED.rank,
        "isSubscribed" = EXCLUDED."isSubscribed",
        "subscriptionTier" = EXCLUDED."subscriptionTier",
        whatsapp = EXCLUDED.whatsapp,
        tags = EXCLUDED.tags,
        "updatedAt" = CURRENT_TIMESTAMP`,
      [
        creator.id,
        creator.name,
        creator.username,
        creator.avatar,
        creator.coverImage,
        creator.category,
        categoryId,
        creator.city,
        creator.location,
        creator.bio,
        creator.rating,
        creator.reviewCount,
        creator.completedBookings,
        creator.rank,
        creator.isSubscribed,
        creator.subscriptionTier,
        creator.whatsapp,
        creator.tags,
      ]
    );

    for (const s of creator.services) {
      await pool.query(
        `INSERT INTO "Service" (id, "creatorId", name, description, price, "discountPrice", duration)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET
           "creatorId" = EXCLUDED."creatorId",
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           price = EXCLUDED.price,
           "discountPrice" = EXCLUDED."discountPrice",
           duration = EXCLUDED.duration`,
        [
          s.id,
          creator.id,
          s.name,
          s.description,
          s.price,
          s.discountPrice ?? null,
          s.duration,
        ]
      );
    }
  }

  await pool.query(
    `INSERT INTO "SiteSettings" (id, content, "updatedAt")
     VALUES ('default', $1::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(defaultSiteContent)]
  );

  await pool.query(
    `INSERT INTO "AppSettings" (id, settings, "updatedAt")
     VALUES ('default', $1::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO NOTHING`,
    [JSON.stringify(defaultAppSettings)]
  );

  console.log("Seed complete.");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
