import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(32);
  const salt = randomString(16);
  const vaultPwd = randomPassword();
  const mongoPassword = randomPassword();
  const prometheusPassword = randomPassword();
  const nginxTemplate = [
    "server {",
    "  listen 8000;",
    "  server_name localhost;",
    "  access_log off;",
    "  error_log /dev/null;",
    "",
    "  location /api/socket.io/ {",
    "    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "    proxy_set_header Host $host;",
    "    proxy_pass http://${SSM_SERVER_HOST}:3000/socket.io/;",
    "    proxy_http_version 1.1;",
    "    proxy_set_header Upgrade $http_upgrade;",
    '    proxy_set_header Connection "upgrade";',
    "  }",
    "",
    "  location /api/ {",
    "    proxy_pass http://${SSM_SERVER_HOST}:3000/;",
    "    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "    proxy_set_header Host $host;",
    "  }",
    "",
    "  location /mcp {",
    "    proxy_pass http://${SSM_SERVER_HOST}:3001/;",
    "    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "    proxy_set_header Host $host;",
    "  }",
    "",
    "  location /static-plugins/ {",
    "    proxy_pass http://${SSM_SERVER_HOST}:3000/static-plugins/;",
    "    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "    proxy_set_header Host $host;",
    "    add_header Cache-Control 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';",
    "    expires off;",
    "  }",
    "",
    "  location / {",
    "    proxy_pass http://${SSM_CLIENT_HOST}:8000/;",
    "    proxy_http_version 1.1;",
    "    proxy_set_header Upgrade $http_upgrade;",
    '    proxy_set_header Connection "upgrade";',
    "  }",
    "}",
  ].join("\n");

  // Proxy — the public-facing entry point; nginx routes /api/* to server and / to client
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.proxyServiceImage,
      },
      env: [
        `SSM_SERVER_HOST=$(PROJECT_NAME)_${input.appServiceName}-server`,
        `SSM_CLIENT_HOST=$(PROJECT_NAME)_${input.appServiceName}-client`,
      ].join("\n"),
      mounts: [
        {
          type: "file",
          content: nginxTemplate,
          mountPath: "/etc/nginx/templates/default.conf.template",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
    },
  });

  // Backend API server
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      source: {
        type: "image",
        image: input.serverServiceImage,
      },
      env: [
        `NODE_ENV=production`,
        `SECRET=${secret}`,
        `SALT=${salt}`,
        `VAULT_PWD=${vaultPwd}`,
        `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_NAME=ssm`,
        `DB_PORT=27017`,
        `DB_AUTH_SOURCE=admin`,
        `DB_USER=mongo`,
        `DB_USER_PWD=${mongoPassword}`,
        `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
        `REDIS_PORT=6379`,
        `PROMETHEUS_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-prometheus:9090`,
        `PROMETHEUS_BASE_URL=/api/v1`,
        `PROMETHEUS_USERNAME=admin`,
        `PROMETHEUS_PASSWORD=${prometheusPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "server-data",
          mountPath: "/data",
        },
      ],
    },
  });

  // React frontend client
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-client`,
      source: {
        type: "image",
        image: input.clientServiceImage,
      },
    },
  });

  // Prometheus metrics collector (custom SSM image with basic auth pre-configured)
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-prometheus`,
      source: {
        type: "image",
        image: input.prometheusServiceImage,
      },
      env: [
        `PROMETHEUS_USERNAME=admin`,
        `PROMETHEUS_PASSWORD=${prometheusPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "prometheus-data",
          mountPath: "/prometheus",
        },
      ],
    },
  });

  // MongoDB
  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: mongoPassword,
    },
  });

  // Redis cache — deployed as a plain app (no auth) because SSM server has no REDIS_PASSWORD support
  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      source: {
        type: "image",
        image: "redis:7-alpine",
      },
      deploy: {
        command: "redis-server --save 60 1",
      },
      mounts: [
        {
          type: "volume",
          name: "redis-data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
