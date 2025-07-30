import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api/accomplishment-tracking': {
        target: 'http://localhost:2010',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/accomplishment-tracking/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/api/user-service': {
        target: 'http://localhost:2020',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/user-service/, ''),
      }
    }
  }
});
