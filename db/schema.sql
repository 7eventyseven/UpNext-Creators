-- UpNext Creators — PostgreSQL schema
-- Apply with:
--   psql "$DATABASE_URL" -f db/schema.sql
--   npm run db:seed
-- Or: npm run db:setup

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE "SubscriptionTier" AS ENUM ('free', 'pro', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Admin" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE DEFAULT 'nungseplangnan@gmail.com',
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Creator" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "username" TEXT NOT NULL UNIQUE,
  "email" TEXT UNIQUE,
  "passwordHash" TEXT,
  "avatar" TEXT NOT NULL,
  "coverImage" TEXT NOT NULL,
  "categoryName" TEXT NOT NULL,
  "categoryId" TEXT REFERENCES "Category"("id") ON DELETE SET NULL,
  "city" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "completedBookings" INTEGER NOT NULL DEFAULT 0,
  "rank" INTEGER NOT NULL DEFAULT 99,
  "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
  "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'free',
  "whatsapp" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Creator_categoryName_idx" ON "Creator"("categoryName");
CREATE INDEX IF NOT EXISTS "Creator_city_idx" ON "Creator"("city");
CREATE INDEX IF NOT EXISTS "Creator_rank_idx" ON "Creator"("rank");

CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT PRIMARY KEY,
  "creatorId" TEXT NOT NULL REFERENCES "Creator"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "discountPrice" INTEGER,
  "duration" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "Service_creatorId_idx" ON "Service"("creatorId");

CREATE TABLE IF NOT EXISTS "CreatorVideo" (
  "id" TEXT PRIMARY KEY,
  "creatorId" TEXT NOT NULL REFERENCES "Creator"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "earnings" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "CreatorVideo_creatorId_idx" ON "CreatorVideo"("creatorId");

CREATE TABLE IF NOT EXISTS "Booking" (
  "id" TEXT PRIMARY KEY,
  "creatorId" TEXT NOT NULL REFERENCES "Creator"("id") ON DELETE CASCADE,
  "creatorName" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "clientPhone" TEXT NOT NULL,
  "notes" TEXT NOT NULL DEFAULT '',
  "status" "BookingStatus" NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Booking_creatorId_idx" ON "Booking"("creatorId");
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");

CREATE TABLE IF NOT EXISTS "Conversation" (
  "id" TEXT PRIMARY KEY,
  "creatorId" TEXT NOT NULL UNIQUE REFERENCES "Creator"("id") ON DELETE CASCADE,
  "creatorName" TEXT NOT NULL,
  "creatorAvatar" TEXT NOT NULL,
  "lastMessage" TEXT NOT NULL DEFAULT 'Start a conversation...',
  "lastMessageTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unread" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "Conversation_creatorId_idx" ON "Conversation"("creatorId");

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  "id" TEXT PRIMARY KEY,
  "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "isOwn" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

CREATE TABLE IF NOT EXISTS "SiteSettings" (
  "id" TEXT PRIMARY KEY DEFAULT 'default',
  "content" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "AppSettings" (
  "id" TEXT PRIMARY KEY DEFAULT 'default',
  "settings" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
