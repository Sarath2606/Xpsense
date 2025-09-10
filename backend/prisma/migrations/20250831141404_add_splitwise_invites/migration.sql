/*
  Warnings:

  - You are about to drop the column `inviteeEmail` on the `splitwise_invites` table. All the data in the column will be lost.
  - You are about to drop the column `inviterId` on the `splitwise_invites` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `splitwise_invites` table. All the data in the column will be lost.
  - Added the required column `email` to the `splitwise_invites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `invitedBy` to the `splitwise_invites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "splitwise_invites" DROP CONSTRAINT "splitwise_invites_inviterId_fkey";

-- AlterTable
ALTER TABLE "splitwise_invites" DROP COLUMN "inviteeEmail",
DROP COLUMN "inviterId",
DROP COLUMN "status",
ADD COLUMN     "accepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "invitedBy" TEXT NOT NULL,
ADD COLUMN     "message" TEXT;

-- AddForeignKey
ALTER TABLE "splitwise_invites" ADD CONSTRAINT "splitwise_invites_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
