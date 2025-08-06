/*
  Warnings:

  - A unique constraint covering the columns `[defaultVariantId]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "defaultVariantId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "products_defaultVariantId_key" ON "public"."products"("defaultVariantId");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_defaultVariantId_fkey" FOREIGN KEY ("defaultVariantId") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
