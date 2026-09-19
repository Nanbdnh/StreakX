-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "icon" TEXT NOT NULL DEFAULT '🔥',
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reminderTime" TEXT;
