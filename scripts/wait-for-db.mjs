import net from "node:net";
import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseDb(urlString) {
  const normalized = urlString.replace(/^postgresql:/, "http:");
  const url = new URL(normalized);
  return { host: url.hostname, port: Number(url.port || 5432) };
}

function waitForPort(host, port, timeoutMs = 60000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const socket = net.connect({ host, port });
      socket.setTimeout(2000);
      socket.on("connect", () => {
        socket.end();
        resolve();
      });
      socket.on("timeout", () => {
        socket.destroy();
        retry();
      });
      socket.on("error", () => {
        socket.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${host}:${port}`));
        return;
      }
      setTimeout(attempt, 1000);
    };
    attempt();
  });
}

loadEnv();
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const { host, port } = parseDb(databaseUrl);
console.log(`Waiting for PostgreSQL at ${host}:${port}...`);
waitForPort(host, port)
  .then(() => {
    console.log("PostgreSQL is reachable.");
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
