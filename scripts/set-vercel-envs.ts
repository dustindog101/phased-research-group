/**
 * Set environment variables on Vercel project via API
 * Usage: VERCEL_TOKEN=xxx bun run scripts/set-vercel-envs.ts
 */

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID ?? "prj_X7M7OFrDepXpYkne5bwmgVBumXUT";
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? "team_6EU1Yo9MpMkU2FJHCFnLQgY2";

if (!VERCEL_TOKEN) {
  console.error("Error: VERCEL_TOKEN environment variable required");
  process.exit(1);
}

import { readFileSync } from "fs";

// Read generated secrets
const secretsPath = process.env.SECRETS_PATH ?? "scripts/vercel-secrets.env";
const secrets = readFileSync(secretsPath, "utf8")
  .trim()
  .split("\n")
  .reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split("=");
    acc[key] = rest.join("=");
    return acc;
  }, {});

const envVars: Array<{ key: string; value: string; type: "encrypted" | "plain"; target: string[] }> = [
  { key: "AUTH_SECRET", value: secrets.AUTH_SECRET, type: "encrypted", target: ["production", "preview", "development"] },
  { key: "PAY_TOKEN_SECRET", value: secrets.PAY_TOKEN_SECRET, type: "encrypted", target: ["production", "preview", "development"] },
  { key: "CRON_SECRET", value: secrets.CRON_SECRET, type: "encrypted", target: ["production"] },
  { key: "CRYPTO_PAYMENTS_ENABLED", value: "true", type: "plain", target: ["production", "preview", "development"] },
  { key: "ADMIN_EMAIL", value: secrets.ADMIN_EMAIL, type: "plain", target: ["production", "preview", "development"] },
  { key: "ADMIN_PASSWORD", value: secrets.ADMIN_PASSWORD, type: "encrypted", target: ["production", "preview", "development"] },
];

async function setEnvVar(key: string, value: string, type: "encrypted" | "plain", target: string[]) {
  const url = `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`;
  const body = { key, value, type, target };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✓ Set ${key} (${target.join(", ")})`);
  } else {
    console.error(`✗ Failed to set ${key}:`, data.error?.message ?? data);
  }
}

async function main() {
  console.log("Setting Vercel environment variables...\n");
  for (const env of envVars) {
    await setEnvVar(env.key, env.value, env.type, env.target);
  }
  console.log("\n✅ All env vars set. Now create a Neon Postgres database and add DATABASE_URL.");
}

main().catch(console.error);
