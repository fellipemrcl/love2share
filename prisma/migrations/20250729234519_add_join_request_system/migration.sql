-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "GroupJoinRequest" (
    "id" TEXT NOT NULL,
    "streamingGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestMessage" TEXT,
    "responseMessage" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "respondedById" TEXT,

    CONSTRAINT "GroupJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupJoinRequest_streamingGroupId_userId_key" ON "GroupJoinRequest"("streamingGroupId", "userId");

-- AddForeignKey
ALTER TABLE "GroupJoinRequest" ADD CONSTRAINT "GroupJoinRequest_streamingGroupId_fkey" FOREIGN KEY ("streamingGroupId") REFERENCES "StreamingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupJoinRequest" ADD CONSTRAINT "GroupJoinRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupJoinRequest" ADD CONSTRAINT "GroupJoinRequest_respondedById_fkey" FOREIGN KEY ("respondedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
