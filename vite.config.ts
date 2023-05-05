import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  esbuild: {
    legalComments: "none",
    sourcemap: false,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    sourcesContent: false,
  },
  plugins: [solidPlugin()],
  server: {
    port: 8080,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: [
      { find: "app-hooks", replacement: "/src/hooks" },
      { find: "ui-components", replacement: "/src/ui-components" },
      { find: "store", replacement: "/src/store" },
      { find: "pages", replacement: "/src/pages" },
      { find: "methods", replacement: "/src/methods" },
      { find: "components", replacement: "/src/components" },
      { find: "types", replacement: "/src/types" },
    ],
  },
});
