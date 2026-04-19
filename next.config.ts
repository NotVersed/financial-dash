import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  serverExternalPackages: ['pdfkit'],
};

export default nextConfig;