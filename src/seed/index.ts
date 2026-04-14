import { categorySeed } from "./categories.seed";
import { userSeed } from "./user.seed";
import "dotenv/config";

async function main() {
  await userSeed();
  await categorySeed(20);
}

main().catch((err) => {
  console.log(err);
}).finally(() => process.exit());