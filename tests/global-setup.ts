import { execFileSync } from "node:child_process";
import { TEST_DATABASE_URL } from "./test-database";

export default function setup() {
  execFileSync("npx", ["prisma", "migrate", "deploy"], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "pipe",
  });
}
