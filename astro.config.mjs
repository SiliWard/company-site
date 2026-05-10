import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://siliward.github.io",
  base: "/company-site",
  integrations: [tailwind()],
  trailingSlash: "never"
});
