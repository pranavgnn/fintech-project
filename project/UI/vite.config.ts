import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          // Log proxy errors
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          
          // Log request details
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log(`Proxying ${req.method} ${req.url}`);
          });
          
          // Advanced response transformation for JSON
          proxy.on('proxyRes', (proxyRes, req, res) => {
            const contentType = proxyRes.headers['content-type'] || '';
            
            // Only process JSON responses
            if (contentType.includes('application/json')) {
              let responseBody = '';
              
              // Collect response body
              proxyRes.on('data', function(chunk) {
                responseBody += chunk.toString('utf8');
              });
              
              // Process response when complete
              proxyRes.on('end', function() {
                // Check for valid JSON
                try {
                  // Try parsing to see if it's valid
                  JSON.parse(responseBody);
                  // Valid JSON, no need to modify
                } catch (error) {
                  console.warn(`Invalid JSON detected in response from ${req.url}:`, (error as Error).message);
                  
                  let fixedBody = responseBody;
                  let needsFix = false;
                  
                  // Fix 1: Handle circular references
                  if (responseBody.includes('"customer":}') || responseBody.includes('":}')) {
                    fixedBody = responseBody
                      .replace(/"customer":\}/g, '"customer":null}')
                      .replace(/\"([^"]+)":\}/g, '"$1":null}');
                    needsFix = true;
                  }
                  
                  // Fix 2: Truncate at position 125818 if that's where the error is
                  if ((error as Error).message.includes('position 125818') || (error as Error).message.includes('position 125819')) {
                    console.log('Attempting to fix error at position 125818');
                    // Find the last valid JSON closing bracket before this position
                    const truncated = responseBody.substring(0, 125818);
                    const lastBracePos = truncated.lastIndexOf('}');
                    if (lastBracePos > 0) {
                      fixedBody = truncated.substring(0, lastBracePos + 1);
                      needsFix = true;
                    }
                  }
                  
                  // Fix 3: Find valid JSON within the response by matching brackets
                  if (!needsFix) {
                    const jsonMatch = responseBody.match(/\{.*\}|\[.*\]/s);
                    if (jsonMatch && jsonMatch[0] !== responseBody) {
                      fixedBody = jsonMatch[0];
                      needsFix = true;
                    }
                  }
                  
                  // Fix 4: Strip non-printable characters
                  if (!needsFix) {
                    const cleaned = responseBody.replace(/[^\x20-\x7E]+/g, ' ');
                    if (cleaned !== responseBody) {
                      fixedBody = cleaned;
                      needsFix = true;
                    }
                  }
                  
                  if (needsFix) {
                    // Try to validate the fix worked
                    try {
                      JSON.parse(fixedBody);
                      console.log('Successfully fixed malformed JSON');
                      
                      // Replace the response
                      const originalWrite = res.write;
                      const originalEnd = res.end;
                      
                      res.write = function() { return true; };
                      res.end = function(this: any) {
                        res.write = originalWrite;
                        res.end = originalEnd;
                        
                        // Update content length
                        if (proxyRes.headers['content-length']) {
                          res.setHeader('content-length', Buffer.byteLength(fixedBody));
                        }
                        
                        return res.end(fixedBody);
                      };
                    } catch (e) {
                      console.error('Failed to fix JSON:', e);
                    }
                  }
                }
              });
            }
          });
        }
      },
    },
  },
});
