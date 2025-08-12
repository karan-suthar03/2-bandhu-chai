/*
  Warnings:

  - Changed the type of `size` on the `product_variants` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."VariantSize" AS ENUM ('GM_250', 'GM_500', 'KG_1');

-- AlterTable
ALTER TABLE "public"."product_variants" DROP COLUMN "size",
ADD COLUMN     "size" "public"."VariantSize" NOT NULL;
