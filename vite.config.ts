import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

//@ts-ignore
import path from "path";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
  resolve: {
    alias: {
      //@ts-ignore
      "@lib": path.resolve(__dirname, "./src/@lib"),
      //@ts-ignore
      "@shared": path.resolve(__dirname, "./src/@shared"),
    },
  },
});
