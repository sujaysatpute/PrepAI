import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

function devApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url || '';
        const urlPath = rawUrl.split('?')[0];

        if (urlPath === '/api/interview' || urlPath === '/api/auth') {
          try {
            process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
            process.env.AUTH_SECRET = env.AUTH_SECRET || 'prepai-secure-session-auth-key-2026';
            
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const bodyText = Buffer.concat(buffers).toString('utf-8');

            const headers = new Headers();
            for (const [key, val] of Object.entries(req.headers)) {
              if (val) {
                headers.set(key, Array.isArray(val) ? val.join(', ') : val);
              }
            }

            const method = req.method || 'GET';
            const fullUrl = `http://localhost:3000${rawUrl}`;
            const reqInit: RequestInit = {
              method,
              headers,
            };
            if (method !== 'GET' && method !== 'HEAD') {
              reqInit.body = bodyText;
            }

            const webReq = new Request(fullUrl, reqInit);

            const modulePath = urlPath === '/api/auth' ? '/api/auth.ts' : '/api/interview.ts';
            const mod = await server.ssrLoadModule(modulePath);
            const handler = mod[method];

            if (typeof handler !== 'function') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Method ${method} not allowed` }));
              return;
            }

            const webRes: Response = await handler(webReq);

            res.statusCode = webRes.status;
            webRes.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });
            const text = await webRes.text();
            res.end(text);
          } catch (err: any) {
            console.error('Dev API error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'Server error' }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Expose to server-side Node runtime only, NOT into the client bundle
  process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
  process.env.AUTH_SECRET = env.AUTH_SECRET || 'prepai-secure-session-auth-key-2026';

  return {
    plugins: [react(), tailwindcss(), devApiPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
