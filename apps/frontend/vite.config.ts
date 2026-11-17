import path from "path";
import { defineConfig, type PluginOption } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { kvDataAdapter } from "@vinext/cloudflare/cache/kv-data-adapter";
import { cdnAdapter } from "@vinext/cloudflare/cache/cdn-adapter";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    vinext({
      cache: { data: kvDataAdapter(), cdn: cdnAdapter() },
    }),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
    (process.env.ANALYZE === "true"
      ? ({
          ...visualizer({
            filename: path.resolve(import.meta.dirname, "dist/stats.html"),
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
          }),
          applyToEnvironment(environment: { name: string }) {
            return environment.name === "client";
          },
        } as PluginOption)
      : null),
  ].filter(Boolean),
});
