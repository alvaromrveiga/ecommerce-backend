-- DropForeignKey
ALTER TABLE "UserTokens" DROP CONSTRAINT "UserTokens_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserTokens" ADD CONSTRAINT "UserTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
