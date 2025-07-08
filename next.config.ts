import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cdn.weatherapi.com",
      "s3-media0.fl.yelpcdn.com"
    ],
  },
};

export default nextConfig;
