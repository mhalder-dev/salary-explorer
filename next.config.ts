import type { NextConfig } from "next";

// When deploying to GitHub Pages under https://<user>.github.io/<repo>,
// set NEXT_PUBLIC_BASE_PATH="/<repo>" (the deploy workflow does this for you).
// For Vercel or a root domain, leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Produce a fully static site in ./out — deployable to any static host for free.
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    // next/image optimization needs a server; static export requires this off.
    unoptimized: true,
  },
};

export default nextConfig;
