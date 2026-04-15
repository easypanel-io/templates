import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const minioAccess = randomPassword();
  const minioSecret = randomPassword();
  const jwtSecret = randomPassword() + randomPassword();
  const encryptionKey = randomPassword() + randomPassword();
  const sessionSecret = randomPassword() + randomPassword();

  const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig(() => {
  const publicUrl = process.env.VITE_PUBLIC_URL || 'http://localhost:5173';
                                                       
  const allowedHosts = process.env.VITE_ALLOWED_HOSTS             
  ? process.env.VITE_ALLOWED_HOSTS.split(',').map(h => h.trim())
  : []                                                                                 
  return {                                                                             
    define: {                                                                          
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(process.env.VITE_BACKEND_URL),
      'import.meta.env.VITE_PUBLIC_URL': JSON.stringify(publicUrl),                    
    },                                                             
    server: {                                 
      host: new URL(publicUrl).hostname,      
      port: parseInt(new URL(publicUrl).port),        
      allowedHosts,                                                                                   
    },                                                
    build: {                                          
      outDir: 'build', 
      manifest: true,             
      chunkSizeWarningLimit: 1024,
    },                            
    plugins: [react()],           
  };                              
});                    `;

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      source: {
        type: "image",
        image: input.minioImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9001,
          path: "/console",
        },
      ],
      env: [
        `MINIO_ROOT_USER=${minioAccess}`,
        `MINIO_ROOT_PASSWORD=${minioSecret}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "minio",
          mountPath: "/data",
        },
      ],
      deploy: {
        command: "minio server /data --console-address :9001",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      source: {
        type: "image",
        image: input.backendImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        `NODE_ENV=production`,
        `JWT_SECRET=${jwtSecret}`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${dbPassword}`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_PORT=5432`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `SESSION_SECRET=${sessionSecret}`,
        `MINIO_ENDPOINT=$(PROJECT_NAME)_${input.appServiceName}-minio`,
        `MINIO_PORT=9000`,
        `MINIO_CONSOLE_PORT=9001`,
        `MINIO_ACCESS_KEY=${minioAccess}`,
        `MINIO_SECRET_KEY=${minioSecret}`,
        `BACKEND_PORT=8080`,
        `FRONTEND_PORT=3000`,
        `BACKEND_URL=https://$(PROJECT_NAME)-${input.appServiceName}-backend.$(EASYPANEL_HOST)`,
        `PUBLIC_URL=https://$(PROJECT_NAME)-${input.appServiceName}-frontend.$(EASYPANEL_HOST)`,
        `VITE_BACKEND_URL=https://$(PROJECT_NAME)-${input.appServiceName}-backend.$(EASYPANEL_HOST)`,
        `VITE_PUBLIC_URL=https://$(PROJECT_NAME)-${input.appServiceName}-frontend.$(EASYPANEL_HOST)`,
        `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`,
        `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0`,
        `CI=true`,
        `CONTAINER=true`,
        `CHROMIUM_FLAGS=--disable-gpu --no-sandbox --headless=new`,
        `BROWSER_WS_PORT=3001`,
        `BROWSER_HEALTH_PORT=3002`,
        `BROWSER_WS_HOST=browser`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "backend-data",
          mountPath: "/var/lib/maxun",
        },
        {
          type: "volume",
          name: "playwright",
          mountPath: "/ms-playwright",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-frontend`,
      source: {
        type: "image",
        image: input.frontendImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5173,
        },
      ],
      mounts: [
        {
          type: "file",
          mountPath: "/app/vite.config.js",
          content: viteConfig,
        },
      ],
      env: [
        `VITE_ALLOWED_HOSTS=$(EASYPANEL_DOMAIN)`,
        `PUBLIC_URL=https://$(PROJECT_NAME)-${input.appServiceName}-frontend.$(EASYPANEL_HOST)`,
        `BACKEND_URL=https://$(PROJECT_NAME)-${input.appServiceName}-backend.$(EASYPANEL_HOST)`,
        `VITE_BACKEND_URL=https://$(PROJECT_NAME)-${input.appServiceName}-backend.$(EASYPANEL_HOST)`,
      ].join("\n"),
    },
  });

  return { services };
}
