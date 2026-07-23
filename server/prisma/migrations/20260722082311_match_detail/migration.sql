-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "detailFetchedAt" TIMESTAMP(3),
ADD COLUMN     "mapGames" JSONB,
ADD COLUMN     "streams" JSONB;
