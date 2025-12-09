import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    // Plugin to handle browser extension injected files
    {
      name: 'ignore-browser-extensions',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Ignore source maps and browser extension files
          const ignoredPatterns = [
            /\.map$/,
            /installHook\.js/,
            /.*Hook\.js$/,
          ];

          if (req.url && ignoredPatterns.some(pattern => pattern.test(req.url!))) {
            res.statusCode = 404;
            res.end();
            return;
          }

          next();
        });
      },
    },
  ],
  server: {
    hmr: {
      overlay: true,
    },
  },
  publicDir: "public",
});
