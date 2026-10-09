import "dotenv/config";
import { Pool } from "pg";
import { defaultCategories } from "../src/lib/categories";

/**
 * Adds any category from `defaultCategories` that is missing in the database.
 * Safe to run repeatedly: existing categories (and any the admin added or
 * removed by hand) are left alone. Unlike `db:seed`, it touches nothing else.
 */
async function main() {
  if (!process.env.DATABASE_URL?.includes("://")) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  let added = 0;

  for (const name of defaultCategories) {
    const result = await pool.query(
      `INSERT INTO "Category" (id, name)
       VALUES ($1, $2)
       ON CONFLICT (name) DO NOTHING`,
      [`cat_${crypto.randomUUID().replace(/-/g, "")}`, name]
    );
    if (result.rowCount) {
      added += 1;
      console.log(`+ ${name}`);
    }
  }

  await pool.end();
  console.log(added === 0 ? "Categories already up to date." : `Added ${added} categories.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
