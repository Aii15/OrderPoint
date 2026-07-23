-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "composition" TEXT[],
    "attributes" JSONB NOT NULL,
    "meters" JSONB NOT NULL,
    "servingDetails" TEXT[],
    "price" INTEGER NOT NULL,
    "availability" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuItem_category_idx" ON "MenuItem"("category");
