import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const clickhousePassword = randomPassword();
  const databasePassword = randomPassword();
  const betterAuthSecret = randomString(32);

  const caddyFile = `
http://{$DOMAIN_NAME} {
    # Enable compression
    encode zstd gzip

    handle /api/* {
        reverse_proxy {$BACKEND_HOST}:3001
    }


    # Proxy all other requests to the client service
    handle {
        reverse_proxy {$CLIENT_HOST}:3002
    }

} 
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-caddy`,
      source: { type: "image", image: input.caddyImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        `DOMAIN_NAME=$(PRIMARY_DOMAIN)`,
        `BACKEND_HOST=$(PROJECT_NAME)-${input.appServiceName}-backend`,
        `CLIENT_HOST=$(PROJECT_NAME)-${input.appServiceName}-client`,
      ].join("\n"),
      mounts: [
        {
          type: "file",
          content: caddyFile,
          mountPath: "/etc/caddy/Caddyfile",
        },
        {
          type: "volume",
          name: "caddy-data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "caddy-config",
          mountPath: "/config",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-clickhouse`,
      source: { type: "image", image: input.clickhouseImage },
      env: [
        `CLICKHOUSE_DB=$(PROJECT_NAME)`,
        `CLICKHOUSE_USER=default`,
        `CLICKHOUSE_PASSWORD=${clickhousePassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "clickhouse-data",
          mountPath: "/var/lib/clickhouse",
        },
        {
          type: "volume",
          name: "clickhouse-config",
          mountPath: "/etc/clickhouse-server/config.d",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      source: { type: "image", image: input.backendImage },
      env: [
        `NODE_ENV=production`,
        `CLICKHOUSE_HOST=http://$(PROJECT_NAME)-${input.appServiceName}-clickhouse:8123`,
        `CLICKHOUSE_DB=$(PROJECT_NAME)`,
        `CLICKHOUSE_PASSWORD=${clickhousePassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)-${input.appServiceName}-postgres`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `BETTER_AUTH_SECRET=${betterAuthSecret}`,
        `BASE_URL=https://$(PROJECT_NAME)-${input.appServiceName}-caddy.$(EASYPANEL_HOST)`,
        `DISABLE_SIGNUP=false`,
        `RESEND_API_KEY=`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-client`,
      source: { type: "image", image: input.clientImage },
      env: [
        `NODE_ENV=production`,
        `NEXT_PUBLIC_BACKEND_URL=https://$(PROJECT_NAME)_${input.appServiceName}-backend.$(EASYPANEL_HOST)`,
        `NEXT_PUBLIC_DISABLE_SIGNUP=false`,
      ].join("\n"),
    },
  });

  return { services };
}
