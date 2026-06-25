import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the automated browser subagent to render pages correctly without 500 origin errors
  allowedDevOrigins: ["host.docker.internal"],
  output: "standalone",
};

export default nextConfig;
