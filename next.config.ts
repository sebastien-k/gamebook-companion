import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf-8",
  }).stdout?.trim() ?? crypto.randomUUID();

const withSerwist = withSerwistInit({
  additionalPrecacheEntries: [{ url: "/offline.html", revision }],
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  // Turbopack config vide pour éviter l'erreur Next.js 16
  // (Serwist utilise webpack, on garde turbopack: {} pour le silence)
  turbopack: {},
};

export default withSerwist(nextConfig);
