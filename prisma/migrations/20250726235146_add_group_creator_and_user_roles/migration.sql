/*
  Warnings:

  - Added the required column `createdById` to the `StreamingGroup` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StreamingGroupRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "StreamingGroup" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StreamingGroupUser" ADD COLUMN     "role" "StreamingGroupRole" NOT NULL DEFAULT 'MEMBER';

-- AddForeignKey
ALTER TABLE "StreamingGroup" ADD CONSTRAINT "StreamingGroup_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
