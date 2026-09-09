import { spawnSync } from "node:child_process";
const result = spawnSync(
  process.execPath,
  [
    "--test",
    "server/test/validation.test.js",
    "server/test/integration.test.js",
  ],
  { stdio: "inherit", env: { ...process.env, DX_INTEGRATION: "1" } },
);
process.exitCode = result.status ?? 1;
