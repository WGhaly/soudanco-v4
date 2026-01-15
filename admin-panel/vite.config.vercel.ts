import { defineConfig } from "vite";
import path from "path";

// Vercel API build configuration - bundles server for serverless deployment
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "server/vercel-build.ts"),
      name: "api",
      fileName: () => "api.mjs",
      formats: ["es"],
    },
    outDir: "dist/api",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",
        "net",
        "tls",
        "dns",
        "zlib",
        "string_decoder",
      ],
      output: {
        format: "es",
        entryFileNames: "[name].mjs",
      },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
