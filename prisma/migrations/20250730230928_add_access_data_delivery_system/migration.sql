-- CreateEnum
CREATE TYPE "AccessDataStatus" AS ENUM ('PENDING', 'SENT', 'CONFIRMED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "AccessDataDeliveryType" AS ENUM ('CREDENTIALS', 'INVITE_LINK', 'ACCOUNT_SHARING', 'INSTRUCTIONS');

-- AlterTable
ALTER TABLE "StreamingGroupUser" ADD COLUMN     "accessDataConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "accessDataDeadline" TIMESTAMP(3),
ADD COLUMN     "accessDataSentAt" TIMESTAMP(3),
ADD COLUMN     "accessDataStatus" "AccessDataStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "AccessDataDelivery" (
    "id" TEXT NOT NULL,
    "streamingGroupUserId" TEXT NOT NULL,
    "deliveryType" "AccessDataDeliveryType" NOT NULL,
    "content" TEXT NOT NULL,
    "isInviteLink" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessDataDelivery_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AccessDataDelivery" ADD CONSTRAINT "AccessDataDelivery_streamingGroupUserId_fkey" FOREIGN KEY ("streamingGroupUserId") REFERENCES "StreamingGroupUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
