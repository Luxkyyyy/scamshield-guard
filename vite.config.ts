import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, type Plugin } from "vite";

// Dev-only: expose the Netlify Function at /api/analyze so the preview works
// exactly like production (Netlify redirects /api/* -> /.netlify/functions/*).
function analyzeApiPlugin(): Plugin {
  return {
    name: "scamshield-analyze-api",
    configureServer(server) {
      server.middlewares.use("/api/analyze", async (req, res) => {
        try {
          const mod = await server.ssrLoadModule("/netlify/functions/analyze.ts");
          const handler = mod.default as (r: Request) => Promise<Response>;

          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const body = Buffer.concat(chunks);

          const url = `http://localhost${req.url ?? "/api/analyze"}`;
          const request = new Request(url, {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: req.method && req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
          });

          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          const buf = Buffer.from(await response.arrayBuffer());
          res.end(buf);
        } catch (err) {
          console.error("[dev /api/analyze]", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Dev analyzer failed.",
            }),
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), analyzeApiPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: "0.0.0.0",
  },
});
