import { writeFileSync } from "node:fs";
import process from "node:process";
import { URL } from "node:url";
import console from "node:console";

const configured = process.env.PEOPLEOS_API_ORIGIN?.trim();
let target = "/.netlify/functions/api-unavailable";
if (configured) {
  const origin = new URL(configured);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("PEOPLEOS_API_ORIGIN must be an HTTPS origin without credentials, a path, query or fragment.");
  }
  target = `${origin.origin}/api/:splat`;
} else {
  console.warn("Frontend-only deployment: API routes will return 503 until PEOPLEOS_API_ORIGIN is configured.");
}
writeFileSync("dist/_redirects", `/api/* ${target} 200!\n/* /index.html 200\n`);
