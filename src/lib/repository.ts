import { PoolClient } from "pg";
import { createId, query, queryAll, queryOne, withTransaction } from "@/lib/db";
import {
  AdminRow,
  BookingRow,
  CategoryRow,
  ConversationRow,
  CreatorRow,
  mapBooking,
  mapConversation,
  mapCreator,
  mapMessage,
  MessageRow,
  ServiceRow,
  SiteSettingsRow,
  AppSettingsRow,
  toTier,
  VideoRow,
} from "@/lib/mappers";
import type { Creator } from "@/types";
import { sortCreators } from "@/lib/sort-creators";

export interface CreatorWriteInput {
  id?: string;
  name: string;
  username: string;
  email?: string | null;
  passwordHash?: string | null;
  avatar: string;
  coverImage: string;
  category: string;
  city: string;
  location: string;
  bio: string;
  rating?: number;
  reviewCount?: number;
  completedBookings?: number;
  rank?: number;
  isSubscribed?: boolean;
  subscriptionTier?: string;
  whatsapp: string;
  tags?: string[];
  services?: Array<{
    id?: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number | null;
    duration: string;
  }>;
  videos?: Array<{
    id?: string;
    title: string;
    url: string;
    earnings?: number;
  }>;
}

async function loadCreatorExtras(creatorIds: string[]) {
  if (creatorIds.length === 0) {
    return {
      servicesByCreator: new Map<string, ServiceRow[]>(),
      videosByCreator: new Map<string, VideoRow[]>(),
    };
  }

  const services = await queryAll<ServiceRow>(
    `SELECT * FROM "Service" WHERE "creatorId" = ANY($1::text[])`,
    [creatorIds]
  );
  const videos = await queryAll<VideoRow>(
    `SELECT * FROM "CreatorVideo" WHERE "creatorId" = ANY($1::text[])`,
    [creatorIds]
  );

  const servicesByCreator = new Map<string, ServiceRow[]>();
  const videosByCreator = new Map<string, VideoRow[]>();

  for (const s of services) {
    const list = servicesByCreator.get(s.creatorId) ?? [];
    list.push(s);
    servicesByCreator.set(s.creatorId, list);
  }
  for (const v of videos) {
    const list = videosByCreator.get(v.creatorId) ?? [];
    list.push(v);
    videosByCreator.set(v.creatorId, list);
  }

  return { servicesByCreator, videosByCreator };
}

export async function findAdminByEmail(email: string) {
  return queryOne<AdminRow>(`SELECT * FROM "Admin" WHERE email = $1`, [email]);
}

export async function countAdmins() {
  const row = await queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "Admin"`);
  return Number(row?.count ?? 0);
}

export async function createAdmin(email: string, passwordHash: string) {
  const id = createId("adm");
  return queryOne<AdminRow>(
    `INSERT INTO "Admin" (id, email, "passwordHash", "updatedAt")
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     RETURNING *`,
    [id, email, passwordHash]
  );
}

export async function listCategories() {
  return queryAll<CategoryRow>(`SELECT * FROM "Category" ORDER BY name ASC`);
}

export async function findCategoryByName(name: string) {
  return queryOne<CategoryRow>(`SELECT * FROM "Category" WHERE name = $1`, [name]);
}

export async function upsertCategory(name: string) {
  const existing = await findCategoryByName(name);
  if (existing) return existing;
  const id = createId("cat");
  return queryOne<CategoryRow>(
    `INSERT INTO "Category" (id, name) VALUES ($1, $2) RETURNING *`,
    [id, name]
  );
}

export async function deleteAllCategories() {
  await query(`DELETE FROM "Category"`);
}

export async function createCategories(names: string[]) {
  for (const name of names) {
    await upsertCategory(name);
  }
}

export async function deleteCategoryByName(name: string) {
  await query(`DELETE FROM "Category" WHERE name = $1`, [name]);
}

export async function countCreatorsByCategory(name: string) {
  const row = await queryOne<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM "Creator" WHERE "categoryName" = $1`,
    [name]
  );
  return Number(row?.count ?? 0);
}

export async function listCreators(): Promise<Creator[]> {
  const rows = await queryAll<CreatorRow>(`SELECT * FROM "Creator"`);
  const { servicesByCreator, videosByCreator } = await loadCreatorExtras(
    rows.map((r) => r.id)
  );
  return sortCreators(
    rows.map((r) =>
      mapCreator(r, servicesByCreator.get(r.id) ?? [], videosByCreator.get(r.id) ?? [])
    )
  );
}

export async function findCreatorById(id: string): Promise<Creator | null> {
  const row = await queryOne<CreatorRow>(`SELECT * FROM "Creator" WHERE id = $1`, [id]);
  if (!row) return null;
  const { servicesByCreator, videosByCreator } = await loadCreatorExtras([id]);
  return mapCreator(row, servicesByCreator.get(id) ?? [], videosByCreator.get(id) ?? []);
}

export async function findCreatorRowById(id: string) {
  return queryOne<CreatorRow>(`SELECT * FROM "Creator" WHERE id = $1`, [id]);
}

export async function findCreatorByEmail(email: string) {
  const row = await queryOne<CreatorRow>(
    `SELECT * FROM "Creator" WHERE lower(email) = lower($1)`,
    [email]
  );
  if (!row) return null;
  const { servicesByCreator, videosByCreator } = await loadCreatorExtras([row.id]);
  return {
    row,
    creator: mapCreator(
      row,
      servicesByCreator.get(row.id) ?? [],
      videosByCreator.get(row.id) ?? []
    ),
  };
}

export async function findCreatorByUsername(username: string) {
  return queryOne<CreatorRow>(
    `SELECT * FROM "Creator" WHERE lower(username) = lower($1)`,
    [username]
  );
}

export async function getMaxCreatorRank() {
  const row = await queryOne<{ max: number | null }>(
    `SELECT MAX(rank) AS max FROM "Creator"`
  );
  return row?.max ?? 0;
}

async function replaceServices(
  client: PoolClient,
  creatorId: string,
  services: NonNullable<CreatorWriteInput["services"]>
) {
  await client.query(`DELETE FROM "Service" WHERE "creatorId" = $1`, [creatorId]);
  for (const s of services) {
    await client.query(
      `INSERT INTO "Service" (id, "creatorId", name, description, price, "discountPrice", duration)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        s.id || createId("svc"),
        creatorId,
        s.name,
        s.description,
        s.price,
        s.discountPrice ?? null,
        s.duration,
      ]
    );
  }
}

async function replaceVideos(
  client: PoolClient,
  creatorId: string,
  videos: NonNullable<CreatorWriteInput["videos"]>
) {
  await client.query(`DELETE FROM "CreatorVideo" WHERE "creatorId" = $1`, [creatorId]);
  for (const v of videos) {
    await client.query(
      `INSERT INTO "CreatorVideo" (id, "creatorId", title, url, earnings)
       VALUES ($1, $2, $3, $4, $5)`,
      [v.id || createId("vid"), creatorId, v.title, v.url, v.earnings ?? 0]
    );
  }
}

export async function createCreator(input: CreatorWriteInput): Promise<Creator> {
  const category = await findCategoryByName(input.category);
  const id = input.id || createId("cre");

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO "Creator" (
        id, name, username, email, "passwordHash", avatar, "coverImage",
        "categoryName", "categoryId", city, location, bio, rating, "reviewCount",
        "completedBookings", rank, "isSubscribed", "subscriptionTier", whatsapp, tags, "updatedAt"
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,CURRENT_TIMESTAMP
      )`,
      [
        id,
        input.name,
        input.username,
        input.email ?? null,
        input.passwordHash ?? null,
        input.avatar,
        input.coverImage,
        input.category,
        category?.id ?? null,
        input.city,
        input.location,
        input.bio,
        input.rating ?? 0,
        input.reviewCount ?? 0,
        input.completedBookings ?? 0,
        input.rank ?? 99,
        input.isSubscribed ?? false,
        toTier(input.subscriptionTier ?? "free"),
        input.whatsapp,
        input.tags ?? [],
      ]
    );

    await replaceServices(client, id, input.services ?? []);
    await replaceVideos(client, id, input.videos ?? []);
  });

  const creator = await findCreatorById(id);
  if (!creator) throw new Error("Failed to create creator");
  return creator;
}

export async function updateCreator(
  id: string,
  input: CreatorWriteInput
): Promise<Creator> {
  const category = await findCategoryByName(input.category);

  await withTransaction(async (client) => {
    const fields: string[] = [
      `name = $2`,
      `username = $3`,
      `email = $4`,
      `avatar = $5`,
      `"coverImage" = $6`,
      `"categoryName" = $7`,
      `"categoryId" = $8`,
      `city = $9`,
      `location = $10`,
      `bio = $11`,
      `rating = $12`,
      `"reviewCount" = $13`,
      `"completedBookings" = $14`,
      `rank = $15`,
      `"isSubscribed" = $16`,
      `"subscriptionTier" = $17`,
      `whatsapp = $18`,
      `tags = $19`,
      `"updatedAt" = CURRENT_TIMESTAMP`,
    ];
    const params: unknown[] = [
      id,
      input.name,
      input.username,
      input.email ?? null,
      input.avatar,
      input.coverImage,
      input.category,
      category?.id ?? null,
      input.city,
      input.location,
      input.bio,
      input.rating ?? 0,
      input.reviewCount ?? 0,
      input.completedBookings ?? 0,
      input.rank ?? 99,
      input.isSubscribed ?? false,
      toTier(input.subscriptionTier ?? "free"),
      input.whatsapp,
      input.tags ?? [],
    ];

    if (input.passwordHash) {
      fields.push(`"passwordHash" = $${params.length + 1}`);
      params.push(input.passwordHash);
    }

    await client.query(
      `UPDATE "Creator" SET ${fields.join(", ")} WHERE id = $1`,
      params
    );

    if (input.services) await replaceServices(client, id, input.services);
    if (input.videos) await replaceVideos(client, id, input.videos);
  });

  const creator = await findCreatorById(id);
  if (!creator) throw new Error("Creator not found");
  return creator;
}

export async function updateCreatorProfile(
  id: string,
  patch: {
    name?: string;
    bio?: string;
    city?: string;
    location?: string;
    whatsapp?: string;
    avatar?: string;
    category?: string;
    services?: CreatorWriteInput["services"];
    videos?: CreatorWriteInput["videos"];
  }
): Promise<Creator> {
  const category = patch.category
    ? await findCategoryByName(patch.category)
    : null;

  await withTransaction(async (client) => {
    const sets: string[] = [`"updatedAt" = CURRENT_TIMESTAMP`];
    const params: unknown[] = [id];

    const add = (column: string, value: unknown) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };

    if (patch.name !== undefined) add("name", patch.name);
    if (patch.bio !== undefined) add("bio", patch.bio);
    if (patch.city !== undefined) add("city", patch.city);
    if (patch.location !== undefined) add("location", patch.location);
    if (patch.whatsapp !== undefined) add("whatsapp", patch.whatsapp);
    if (patch.avatar !== undefined) add("avatar", patch.avatar);
    if (patch.category !== undefined) {
      add(`"categoryName"`, patch.category);
      add(`"categoryId"`, category?.id ?? null);
    }

    await client.query(`UPDATE "Creator" SET ${sets.join(", ")} WHERE id = $1`, params);

    if (patch.services) await replaceServices(client, id, patch.services);
    if (patch.videos) await replaceVideos(client, id, patch.videos);
  });

  const creator = await findCreatorById(id);
  if (!creator) throw new Error("Creator not found");
  return creator;
}

export async function deleteCreator(id: string) {
  await query(`DELETE FROM "Creator" WHERE id = $1`, [id]);
}

export async function listBookings(creatorId?: string | null) {
  const rows = creatorId
    ? await queryAll<BookingRow>(
        `SELECT * FROM "Booking" WHERE "creatorId" = $1 ORDER BY "createdAt" DESC`,
        [creatorId]
      )
    : await queryAll<BookingRow>(
        `SELECT * FROM "Booking" ORDER BY "createdAt" DESC`
      );
  return rows.map(mapBooking);
}

export async function createBooking(input: {
  creatorId: string;
  creatorName: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  notes: string;
}) {
  const id = createId("bkg");
  const row = await queryOne<BookingRow>(
    `INSERT INTO "Booking" (
      id, "creatorId", "creatorName", "serviceId", "serviceName", price,
      date, time, "clientName", "clientPhone", notes, "updatedAt"
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      id,
      input.creatorId,
      input.creatorName,
      input.serviceId,
      input.serviceName,
      input.price,
      input.date,
      input.time,
      input.clientName,
      input.clientPhone,
      input.notes,
    ]
  );
  if (!row) throw new Error("Failed to create booking");
  return mapBooking(row);
}

export async function updateBookingStatus(
  id: string,
  status: BookingRow["status"]
) {
  const row = await queryOne<BookingRow>(
    `UPDATE "Booking" SET status = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return row ? mapBooking(row) : null;
}

export async function deleteBooking(id: string) {
  await query(`DELETE FROM "Booking" WHERE id = $1`, [id]);
}

export async function listConversations() {
  const rows = await queryAll<ConversationRow>(
    `SELECT * FROM "Conversation" ORDER BY "lastMessageTime" DESC`
  );
  return rows.map(mapConversation);
}

export async function ensureConversation(input: {
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
}) {
  const existing = await queryOne<ConversationRow>(
    `SELECT * FROM "Conversation" WHERE "creatorId" = $1`,
    [input.creatorId]
  );
  if (existing) {
    const row = await queryOne<ConversationRow>(
      `UPDATE "Conversation"
       SET "creatorName" = $2,
           "creatorAvatar" = COALESCE(NULLIF($3, ''), "creatorAvatar"),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE "creatorId" = $1
       RETURNING *`,
      [input.creatorId, input.creatorName, input.creatorAvatar]
    );
    return mapConversation(row!);
  }

  const id = createId("cnv");
  const row = await queryOne<ConversationRow>(
    `INSERT INTO "Conversation" (id, "creatorId", "creatorName", "creatorAvatar", "updatedAt")
     VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
     RETURNING *`,
    [id, input.creatorId, input.creatorName, input.creatorAvatar]
  );
  return mapConversation(row!);
}

export async function listMessages(conversationId: string) {
  const rows = await queryAll<MessageRow>(
    `SELECT * FROM "ChatMessage" WHERE "conversationId" = $1 ORDER BY "createdAt" ASC`,
    [conversationId]
  );
  return rows.map(mapMessage);
}

export async function createMessage(input: {
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  isOwn: boolean;
}) {
  const id = createId("msg");
  const row = await queryOne<MessageRow>(
    `INSERT INTO "ChatMessage" (id, "conversationId", "senderId", "senderName", text, "isOwn")
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      id,
      input.conversationId,
      input.senderId,
      input.senderName,
      input.text,
      input.isOwn,
    ]
  );
  return mapMessage(row!);
}

export async function touchConversation(
  conversationId: string,
  lastMessage: string,
  lastMessageTime = new Date()
) {
  await query(
    `UPDATE "Conversation"
     SET "lastMessage" = $2, "lastMessageTime" = $3, "updatedAt" = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [conversationId, lastMessage, lastMessageTime]
  );
}

export async function deleteConversation(id: string) {
  await query(`DELETE FROM "Conversation" WHERE id = $1`, [id]);
}

export async function getSiteSettings() {
  return queryOne<SiteSettingsRow>(
    `SELECT * FROM "SiteSettings" WHERE id = 'default'`
  );
}

export async function upsertSiteSettings(content: unknown) {
  const row = await queryOne<SiteSettingsRow>(
    `INSERT INTO "SiteSettings" (id, content, "updatedAt")
     VALUES ('default', $1::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE
       SET content = EXCLUDED.content, "updatedAt" = CURRENT_TIMESTAMP
     RETURNING *`,
    [JSON.stringify(content)]
  );
  return row!;
}

export async function getAppSettingsRow() {
  return queryOne<AppSettingsRow>(
    `SELECT * FROM "AppSettings" WHERE id = 'default'`
  );
}

export async function upsertAppSettings(settings: unknown) {
  const row = await queryOne<AppSettingsRow>(
    `INSERT INTO "AppSettings" (id, settings, "updatedAt")
     VALUES ('default', $1::jsonb, CURRENT_TIMESTAMP)
     ON CONFLICT (id) DO UPDATE
       SET settings = EXCLUDED.settings, "updatedAt" = CURRENT_TIMESTAMP
     RETURNING *`,
    [JSON.stringify(settings)]
  );
  return row!;
}

export async function getAdminStats() {
  const [creators, bookings, categories] = await Promise.all([
    queryAll<{ isSubscribed: boolean }>(`SELECT "isSubscribed" FROM "Creator"`),
    queryAll<{ status: string; price: number }>(
      `SELECT status, price FROM "Booking"`
    ),
    queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM "Category"`),
  ]);

  return {
    creators: creators.length,
    subscribed: creators.filter((c) => c.isSubscribed).length,
    bookings: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    categories: Number(categories?.count ?? 0),
    revenue: bookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + b.price, 0),
  };
}
