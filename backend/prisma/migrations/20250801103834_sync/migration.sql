/*
  Warnings:

  - The `image` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `images` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "image",
ADD COLUMN     "image" JSONB,
DROP COLUMN "images",
ADD COLUMN     "images" JSONB[];
