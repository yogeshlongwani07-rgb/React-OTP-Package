import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "ReactOtpSwift",
      fileName: "react-otp-swift",
    },
    rollupOptions: {
      // React must NOT be bundled — consumers supply it
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJsxRuntime",
        },
      },
    },
    // Keep the bundle small
    minify: "esbuild",
    sourcemap: true,
  },
});
