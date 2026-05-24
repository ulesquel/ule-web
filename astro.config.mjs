// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Ubuntu",
      cssVariable: "--font-ubuntu",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/ubuntu-font-family-0.83/Ubuntu-R.ttf"],
            weight: "normal",
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/ubuntu-font-family-0.83/Ubuntu-B.ttf"],
            weight: "bold",
            style: "normal",
          },
        ],
      },
    },
  ],
});
