import { Output, Services, randomPassword, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const gatewayToken = input.gatewayToken || randomPassword();
  const encryptionKey = input.encryptionKey || randomString(32);

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
      image: "pgvector/pgvector:pg18",
      env: 'PGDATA=/var/lib/postgresql/data',
    },
  });

  const providerKeyEnv = input.providerApiKey
    ? `GOCLAW_${input.provider.toUpperCase()}_API_KEY=${input.providerApiKey}`
    : ``;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `GOCLAW_HOST=0.0.0.0`,
        `GOCLAW_PORT=18790`,
        `GOCLAW_CONFIG=/app/data/config.json`,
        `GOCLAW_DATA_DIR=/app/data`,
        `GOCLAW_WORKSPACE=/app/workspace`,
        `GOCLAW_SKILLS_DIR=/app/skills`,
        `GOCLAW_SESSIONS_DIR=/app/sessions`,
        `GOCLAW_GATEWAY_TOKEN=${gatewayToken}`,
        `GOCLAW_ENCRYPTION_KEY=${encryptionKey}`,
        `ROD_CHROME_BIN=/usr/bin/chromium-browser`,
        `GOCLAW_POSTGRES_DSN=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
        providerKeyEnv,
      ]
        .filter(Boolean)
        .join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "workspace",
          mountPath: "/app/workspace",
        },
        {
          type: "volume",
          name: "skills",
          mountPath: "/app/skills",
        },
        {
          type: "volume",
          name: "sessions",
          mountPath: "/app/sessions",
        },
        {
          type: "file",
          mountPath: "/app/data/.runtime/apk-packages",
          content: ["chromium","nss","freetype","harfbuzz","font-ubuntu"]
            .join("\n"),
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.uiServiceName || "goclaw-ui",
      source: {
        type: "image",
        image: "ghcr.io/nextlevelbuilder/goclaw-web:latest",
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
          mountPath: "/etc/nginx/conf.d/default.conf",
          content: `server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;
    
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location /ws {
        proxy_pass http://${input.appServiceName}:18790;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 86400s;
    }
    
    location /v1/ {
        proxy_pass http://${input.appServiceName}:18790;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /health {
        proxy_pass http://${input.appServiceName}:18790;
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
`,
        },
      ],
    },
  });

  return { services };
}
