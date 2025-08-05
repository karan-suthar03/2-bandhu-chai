/*
  Warnings:

  - You are about to drop the column `orderNumber` on the `orders` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."orders_orderNumber_key";

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "orderNumber";
