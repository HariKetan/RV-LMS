/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com", "lh3.googleusercontent.com", "localhost"],
  },
  output: "standalone",
};

export default nextConfig;
