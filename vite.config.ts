import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "notification-mfe",
      filename: "remoteEntry.js",
      exposes: {
        "./NotificationCard": "./src/components/NotificationCard.tsx",
      },
      shared: ["react", "react-dom", "react-toastify", "axios"],
    }),
    tailwindcss(),
  ],
  define: {
    global: "window",
  },
  build: {
    target: "esnext",
    minify: true,
    cssCodeSplit: false,
  },
});
