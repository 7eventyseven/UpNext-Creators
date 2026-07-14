import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { Pool } from "pg";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = readFileSync(schemaPath, "utf8");
  await pool.query(sql);
  await pool.end();
  console.log("Schema applied from db/schema.sql");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
