/*
  Warnings:

  - A unique constraint covering the columns `[projectId,name]` on the table `Sprint` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Sprint_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Sprint_projectId_name_key" ON "Sprint"("projectId", "name");
