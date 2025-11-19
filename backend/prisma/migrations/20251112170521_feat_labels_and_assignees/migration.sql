/*
  Warnings:

  - The primary key for the `AssigneesOnCards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assignedAt` on the `AssigneesOnCards` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AssigneesOnCards" DROP CONSTRAINT "AssigneesOnCards_cardId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AssigneesOnCards" DROP CONSTRAINT "AssigneesOnCards_userId_fkey";

-- AlterTable
ALTER TABLE "AssigneesOnCards" DROP CONSTRAINT "AssigneesOnCards_pkey",
DROP COLUMN "assignedAt",
ADD CONSTRAINT "AssigneesOnCards_pkey" PRIMARY KEY ("cardId", "userId");

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabelsOnCards" (
    "cardId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,

    CONSTRAINT "LabelsOnCards_pkey" PRIMARY KEY ("cardId","labelId")
);

-- AddForeignKey
ALTER TABLE "AssigneesOnCards" ADD CONSTRAINT "AssigneesOnCards_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssigneesOnCards" ADD CONSTRAINT "AssigneesOnCards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelsOnCards" ADD CONSTRAINT "LabelsOnCards_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabelsOnCards" ADD CONSTRAINT "LabelsOnCards_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
