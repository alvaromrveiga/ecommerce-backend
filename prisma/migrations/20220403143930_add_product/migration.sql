-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "basePrice" DECIMAL(65,30) NOT NULL,
    "discountPercentage" INTEGER NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
