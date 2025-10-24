-- ScribbleAI Complete Migration for Supabase
-- Run this in Supabase SQL Editor

-- Add folderId to Note table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'Note' AND column_name = 'folderId') THEN
        ALTER TABLE "Note" ADD COLUMN "folderId" TEXT;
    END IF;
END $$;

-- Create Folder table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "parentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- Create QuickNote table if it doesn't exist
CREATE TABLE IF NOT EXISTS "QuickNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "color" TEXT,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuickNote_pkey" PRIMARY KEY ("id")
);

-- Create SourceAccount table if it doesn't exist
CREATE TABLE IF NOT EXISTS "SourceAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "scopes" TEXT[],
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SourceAccount_pkey" PRIMARY KEY ("id")
);

-- Create ExternalItem table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ExternalItem" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "snippet" TEXT,
    "content" TEXT,
    "mimeType" TEXT,
    "webViewUrl" TEXT,
    "modifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalItem_pkey" PRIMARY KEY ("id")
);

-- Create Search table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Search" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "clickedNoteId" TEXT,
    "executionTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- Create Conversation table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Conversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Folder_userId_idx" ON "Folder"("userId");
CREATE INDEX IF NOT EXISTS "Folder_parentId_idx" ON "Folder"("parentId");
CREATE INDEX IF NOT EXISTS "QuickNote_userId_idx" ON "QuickNote"("userId");
CREATE INDEX IF NOT EXISTS "SourceAccount_userId_idx" ON "SourceAccount"("userId");
CREATE INDEX IF NOT EXISTS "SourceAccount_userId_provider_idx" ON "SourceAccount"("userId", "provider");
CREATE INDEX IF NOT EXISTS "ExternalItem_userId_idx" ON "ExternalItem"("userId");
CREATE INDEX IF NOT EXISTS "ExternalItem_externalId_idx" ON "ExternalItem"("externalId");
CREATE INDEX IF NOT EXISTS "ExternalItem_userId_provider_idx" ON "ExternalItem"("userId", "provider");
CREATE INDEX IF NOT EXISTS "Search_userId_idx" ON "Search"("userId");
CREATE INDEX IF NOT EXISTS "Conversation_userId_idx" ON "Conversation"("userId");

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Note_folderId_fkey') THEN
        ALTER TABLE "Note" ADD CONSTRAINT "Note_folderId_fkey" 
            FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Folder_parentId_fkey') THEN
        ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" 
            FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Folder_userId_fkey') THEN
        ALTER TABLE "Folder" ADD CONSTRAINT "Folder_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuickNote_userId_fkey') THEN
        ALTER TABLE "QuickNote" ADD CONSTRAINT "QuickNote_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SourceAccount_userId_fkey') THEN
        ALTER TABLE "SourceAccount" ADD CONSTRAINT "SourceAccount_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ExternalItem_userId_fkey') THEN
        ALTER TABLE "ExternalItem" ADD CONSTRAINT "ExternalItem_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Search_userId_fkey') THEN
        ALTER TABLE "Search" ADD CONSTRAINT "Search_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Conversation_userId_fkey') THEN
        ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Success message
SELECT 'Migration completed successfully!' as result;

