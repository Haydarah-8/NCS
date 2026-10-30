import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: root,
  // Vercel expects .next; locally the build lives in .next-ncs.
  distDir: process.env.VERCEL ? '.next' : '.next-ncs',
  // The local development database (PGlite) ships WebAssembly; load it from node_modules as is.
  serverExternalPackages: ['@electric-sql/pglite'],
  async rewrites() { return [{ source: '/admin', destination: '/admin/index.html' }]; },
  async redirects() {
    return [
      { source: "/privacy", destination: "/privacy-policy", permanent: false },
      { source: "/contact", destination: "/our-details", permanent: false },
      // The old management and officer panels are gone; the admin is all there is.
      { source: "/manage/:path*", destination: "/admin", permanent: false },
      { source: "/officer/:path*", destination: "/admin", permanent: false },
      { source: "/manage", destination: "/admin", permanent: false },
      { source: "/officer", destination: "/admin", permanent: false },
    ];
  },
};

export default nextConfig;

