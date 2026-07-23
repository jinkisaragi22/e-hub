-- CreateTable
CREATE TABLE "SyncMeta" (
    "key" TEXT NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncMeta_pkey" PRIMARY KEY ("key")
);
