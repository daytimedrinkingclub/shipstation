/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.js",
    remotePatterns: [
      { hostname: "aceternity.com" },
      { hostname: "assets.aceternity.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "assets.website-files.com" },
    ],
    domains: ["api.microlink.io", "assets.website-files.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "export",
};

export default nextConfig;
