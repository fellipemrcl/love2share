-- CreateTable
CREATE TABLE "Streaming" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "platform" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "monthlyPrice" DOUBLE PRECISION,
    "maxUsers" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streaming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamingGroupStreaming" (
    "id" TEXT NOT NULL,
    "streamingGroupId" TEXT NOT NULL,
    "streamingId" TEXT NOT NULL,
    "accountEmail" TEXT NOT NULL,
    "accountPassword" TEXT NOT NULL,
    "isAccountOwner" BOOLEAN NOT NULL DEFAULT false,
    "accountOwnerId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StreamingGroupStreaming_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StreamingGroupStreaming_streamingGroupId_streamingId_key" ON "StreamingGroupStreaming"("streamingGroupId", "streamingId");

-- AddForeignKey
ALTER TABLE "StreamingGroupStreaming" ADD CONSTRAINT "StreamingGroupStreaming_streamingGroupId_fkey" FOREIGN KEY ("streamingGroupId") REFERENCES "StreamingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamingGroupStreaming" ADD CONSTRAINT "StreamingGroupStreaming_streamingId_fkey" FOREIGN KEY ("streamingId") REFERENCES "Streaming"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamingGroupStreaming" ADD CONSTRAINT "StreamingGroupStreaming_accountOwnerId_fkey" FOREIGN KEY ("accountOwnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
