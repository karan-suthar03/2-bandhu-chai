-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "oldPrice" TEXT,
    "discount" TEXT,
    "description" TEXT NOT NULL,
    "longDescription" TEXT,
    "category" TEXT NOT NULL,
    "badge" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isNew" BOOLEAN NOT NULL DEFAULT false,
    "organic" BOOLEAN NOT NULL DEFAULT false,
    "fastDelivery" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT NOT NULL,
    "images" TEXT[],
    "features" TEXT[],
    "sizes" JSONB,
    "specifications" JSONB,
    "brewingInstructions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
