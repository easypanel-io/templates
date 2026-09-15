import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databaseServiceName = `${input.appServiceName}-db`;
  const redisServiceName = `${input.appServiceName}-redis`;
  const backendServiceName = `${input.appServiceName}-backend`;
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const sessionSecret = randomString(48);
  const encryptionKey = Array.from(
    { length: 64 },
    () => "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");
  // $(PRIMARY_DOMAIN) only resolves for the service that owns the domain, so
  // the backend (which has no domain of its own) needs the frontend's
  // auto-generated domain spelled out explicitly instead.
  const appUrl = `https://$(PROJECT_NAME)-${input.appServiceName}.$(EASYPANEL_HOST)`;

  services.push({
    type: "app",
    data: {
      serviceName: backendServiceName,
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      env: [
        `NODE_ENV=production`,
        `PORT=3000`,
        `SESSION_SECRET=${sessionSecret}`,
        `APP_URL=${appUrl}`,
        `FRONTEND_URL=${appUrl}`,
        `DB_HOST=$(PROJECT_NAME)_${databaseServiceName}`,
        `DB_PORT=5432`,
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${redisServiceName}:6379`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `VAPID_PUBLIC_KEY=${input.vapidPublicKey || ""}`,
        `VAPID_PRIVATE_KEY=${input.vapidPrivateKey || ""}`,
        `VAPID_SUBJECT=${input.vapidSubject || ""}`,
      ].join("\n"),
    },
  });

  const backendUpstream = `$(PROJECT_NAME)_${backendServiceName}:3000`;

  const nginxConfig = `
server {
    listen 80;
    server_name _;

    add_header X-Content-Type-Options    "nosniff" always;
    add_header X-Frame-Options           "SAMEORIGIN" always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy        "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy   "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data: https:; img-src 'self' data: https: blob:; connect-src 'self' wss: ws:; frame-src 'self'; object-src 'none'; base-uri 'self';" always;

    root /usr/share/nginx/html;
    index index.html;

    client_max_body_size 50m;

    proxy_buffer_size       128k;
    proxy_buffers           4 256k;
    proxy_busy_buffers_size 256k;

    location /oauth/ {
        proxy_pass         http://${backendUpstream};
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout 30s;
    }

    location /auth/oidc/ {
        proxy_pass         http://${backendUpstream};
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout 30s;
    }

    location = /api/rules/run {
        proxy_pass         http://${backendUpstream};
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout 300s;
    }

    location /api/ai/ {
        proxy_pass             http://${backendUpstream};
        proxy_http_version     1.1;
        proxy_set_header       Host $host;
        proxy_set_header       X-Real-IP $remote_addr;
        proxy_set_header       X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header       X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout     300s;
        proxy_buffering        off;
        proxy_cache            off;
    }

    location /api/ {
        proxy_pass         http://${backendUpstream};
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout 60s;
    }

    location /ws {
        proxy_pass         http://${backendUpstream};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout 86400s;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store" always;
    }

    location = /sw.js {
        add_header Cache-Control "no-store" always;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: nginxConfig,
          mountPath: "/etc/nginx/conf.d/default.conf",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
