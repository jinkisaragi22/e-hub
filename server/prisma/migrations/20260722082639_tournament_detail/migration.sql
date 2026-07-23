-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "brackets" JSONB,
ADD COLUMN     "detailFetchedAt" TIMESTAMP(3),
ADD COLUMN     "standings" JSONB;
