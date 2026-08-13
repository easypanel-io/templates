import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbServiceName = `${input.appServiceName}-db`;
  const clickhouseServiceName = `${input.appServiceName}-ch`;
  const rabbitmqServiceName = `${input.appServiceName}-rabbitmq`;
  const valkeyServiceName = `${input.appServiceName}-valkey`;
  const frontendServiceName = `${input.appServiceName}-frontend`;
  const restApiServiceName = `${input.appServiceName}-api`;

  const postgresPassword = randomPassword();
  const clickhousePassword = randomPassword();
  const rabbitmqPassword = randomPassword();
  const valkeyPassword = randomPassword();

  const backendCommonEnv = [
    `CLICKHOUSE_DATABASE=poeticmetric`,
    `CLICKHOUSE_HOST=$(PROJECT_NAME)_${clickhouseServiceName}`,
    `CLICKHOUSE_PASSWORD=${clickhousePassword}`,
    `CLICKHOUSE_PORT=9000`,
    `CLICKHOUSE_USER=poeticmetric`,
    `POSTGRES_DATABASE=poeticmetric`,
    `POSTGRES_HOST=$(PROJECT_NAME)_${dbServiceName}`,
    `POSTGRES_PASSWORD=${postgresPassword}`,
    `POSTGRES_PORT=5432`,
    `POSTGRES_USER=postgres`,
    `RABBITMQ_HOST=$(PROJECT_NAME)_${rabbitmqServiceName}`,
    `RABBITMQ_PASSWORD=${rabbitmqPassword}`,
    `RABBITMQ_PORT=5672`,
    `RABBITMQ_USER=poeticmetric`,
    `RABBITMQ_VHOST=/`,
    `FRONTEND_BASE_URL=https://$(PRIMARY_DOMAIN)`,
    `REST_API_BASE_URL=https://$(PRIMARY_DOMAIN)/api`,
    `SMTP_FROM_ADDRESS=${input.smtpFromAddress}`,
    `SMTP_HOST=${input.smtpHost}`,
    `SMTP_PORT=${input.smtpPort}`,
    `SMTP_USER=${input.smtpUser || ""}`,
    `SMTP_PASSWORD=${input.smtpPassword || ""}`,
    `VALKEY_HOST=$(PROJECT_NAME)-${valkeyServiceName}`,
    `VALKEY_PASSWORD=${valkeyPassword}`,
    `VALKEY_PORT=6379`,
  ];

  const caddyFile = `
http://{$PRIMARY_DOMAIN} {
    handle_path /api* {
        reverse_proxy {$REST_API_URL}:80
    }

    reverse_proxy /* {$FRONTEND_URL}:80
}
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-caddy`,
      source: { type: "image", image: "caddy:2.8-alpine" },
      env: [
        `PRIMARY_DOMAIN=$(PRIMARY_DOMAIN)`,
        `FRONTEND_URL=$(PROJECT_NAME)_${frontendServiceName}`,
        `REST_API_URL=$(PROJECT_NAME)_${restApiServiceName}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
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
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: frontendServiceName,
      source: {
        type: "image",
        image: input.frontendServiceImage,
      },
      env: [
        `VITE_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `VITE_REST_API_BASE_URL=https://$(PRIMARY_DOMAIN)/api`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: restApiServiceName,
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      env: [...backendCommonEnv, `INSTANCE=rest-api`].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-scheduler`,
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      env: [...backendCommonEnv, `INSTANCE=scheduler`].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-worker`,
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      env: [...backendCommonEnv, `INSTANCE=worker`].join("\n"),
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      databaseName: "poeticmetric",
      password: postgresPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: clickhouseServiceName,
      source: {
        type: "image",
        image: "clickhouse/clickhouse-server:25.2",
      },
      env: [
        `CLICKHOUSE_DB=poeticmetric`,
        `CLICKHOUSE_USER=poeticmetric`,
        `CLICKHOUSE_PASSWORD=${clickhousePassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "clickhouse-data",
          mountPath: "/var/lib/clickhouse",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: rabbitmqServiceName,
      source: {
        type: "image",
        image: "rabbitmq:4.2.2-management-alpine",
      },
      env: [
        `RABBITMQ_DEFAULT_USER=poeticmetric`,
        `RABBITMQ_DEFAULT_PASS=${rabbitmqPassword}`,
        `RABBITMQ_DEFAULT_VHOST=/`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/rabbitmq",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: valkeyServiceName,
      image: "valkey/valkey:9.0.1-alpine",
      password: valkeyPassword,
      command: `valkey-server --requirepass ${valkeyPassword}`,
    },
  });

  return { services };
}
