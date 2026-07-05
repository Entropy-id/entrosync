/*
  Warnings:

  - The values [PENDING] on the enum `MilestoneStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MilestoneStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');
ALTER TABLE "public"."milestones" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "milestones" ALTER COLUMN "status" TYPE "MilestoneStatus_new" USING ("status"::text::"MilestoneStatus_new");
ALTER TYPE "MilestoneStatus" RENAME TO "MilestoneStatus_old";
ALTER TYPE "MilestoneStatus_new" RENAME TO "MilestoneStatus";
DROP TYPE "public"."MilestoneStatus_old";
ALTER TABLE "milestones" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('ON_PROGRESS', 'NOT_STARTED', 'DONE');
ALTER TABLE "public"."projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "public"."ProjectStatus_old";
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');
ALTER TABLE "public"."tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "status" TYPE "TaskStatus_new" USING ("status"::text::"TaskStatus_new");
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "public"."TaskStatus_old";
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
COMMIT;

-- AlterTable
ALTER TABLE "milestones" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';

-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
