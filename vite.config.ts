import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    monkey({
      entry: "src/main.ts",
      userscript: {
        icon: "https://vitejs.dev/logo.svg",
        namespace: "npm/vite-plugin-monkey",
        match: ["https://mkwrs.com/*"],
        description: {
          en: "Show graph of Mario Kart WR History",
          ja: "マリオカートのWR Historyのグラフを表示します",
        },
        license: "MIT",
        require: [
          "https://cdnjs.cloudflare.com/ajax/libs/apexcharts/4.3.0/apexcharts.min.js",
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      external: ["apexcharts"],
      output: {
        globals: {
          apexcharts: "ApexCharts",
        },
      },
    },
  },
});
