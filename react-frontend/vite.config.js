import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/react/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:5254",
      "/user/Login": "http://localhost:5254",
      "/user/Register": "http://localhost:5254",
      "/CreateOrder": "http://localhost:5254",
    },
  },
  build: {
    outDir: fileURLToPath(
      new URL(
        "../4. Frameworks And Drivers/UI/NorthWind.Sales.WebApi/wwwroot/react",
        import.meta.url,
      ),
    ),
    emptyOutDir: true,
  },
}));
