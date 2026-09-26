/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export so we can host as plain files (Claude Artifact / GH Pages).
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
