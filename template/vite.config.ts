import { defineConfig } from "vite";
import { htmlPages, siteConfig } from "./plugins/site-config.ts";

export default defineConfig({
  plugins: [siteConfig()],
  build: {
    outDir: "dist",
    rollupOptions: {
      // Every index.html (plus 404.html) is a page; see htmlPages.
      input: htmlPages(import.meta.dirname),
    },
  },
});
