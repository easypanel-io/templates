import { randomBytes } from "crypto";
import { Output } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const registry = "chaitin-registry.cn-hangzhou.cr.aliyuncs.com/monkeycode";
  const secret = () => randomBytes(24).toString("hex");

  return {
    services: [
      {
        type: "compose",
        data: {
          serviceName: input.serviceName,
          env: [
            `MONKEYAI_ADMIN_IMAGE=${registry}/monkeyai-admin:${input.appVersion}`,
            `MONKEYAI_BACKEND_IMAGE=${registry}/monkeyai-backend:${input.appVersion}`,
            `MONKEYAI_MIGRATE_IMAGE=${registry}/monkeyai-migrate:${input.appVersion}`,
            "MONKEYAI_PUBLIC_URL=https://$(PRIMARY_DOMAIN)",
            `MONKEYAI_INITIAL_ADMIN_EMAIL=${input.adminEmail}`,
            `MONKEYAI_INITIAL_ADMIN_PASSWORD=${secret()}`,
            `POSTGRES_PASSWORD=${secret()}`,
            `RUSTFS_ACCESS_KEY=${secret()}`,
            `RUSTFS_SECRET_KEY=${secret()}`,
          ].join("\n"),
          source: {
            type: "inline",
            content: `x-app: &app
  init: true
  read_only: true
  tmpfs:
    - /tmp
  restart: unless-stopped
x-healthcheck: &healthcheck
  interval: 10s
  timeout: 5s
  retries: 5
services:
  init-volumes:
    image: $MONKEYAI_BACKEND_IMAGE
    user: "0:0"
    entrypoint: ["/bin/sh", "-c"]
    command:
      - chown 10001:10001 /data /logs /runtime /license /import-tmp && chmod 700 /data /logs /runtime /license /import-tmp
    read_only: true
    restart: "no"
    volumes:
      - rustfs:/data
      - rustfs-logs:/logs
      - runtime:/runtime
      - license:/license
      - import-tmp:/import-tmp
  admin:
    <<: *app
    image: $MONKEYAI_ADMIN_IMAGE
    depends_on:
      backend:
        condition: service_healthy
    environment:
      MONKEYAI_PUBLIC_URL: $MONKEYAI_PUBLIC_URL
      MONKEYAI_TLS_ENABLED: "false"
      MONKEYAI_AUTO_TLS_ENABLED: "false"
    expose:
      - "8080"
    healthcheck:
      <<: *healthcheck
      start_period: 5s
      test: ["CMD", "wget", "-Y", "off", "-q", "--spider", "http://127.0.0.1:8080/healthz"]
  backend:
    <<: *app
    image: $MONKEYAI_BACKEND_IMAGE
    depends_on:
      init-volumes:
        condition: service_completed_successfully
      migrate:
        condition: service_completed_successfully
      rustfs:
        condition: service_healthy
    environment:
      MONKEYAI_PUBLIC_URL: $MONKEYAI_PUBLIC_URL
      MONKEYAI_DATABASE_URL: &database-url postgres://monkeyai:$POSTGRES_PASSWORD@db:5432/monkeyai?sslmode=disable
      MONKEYAI_HTTP_ADDR: :8080
      MONKEYAI_INITIAL_ADMIN_EMAIL: $MONKEYAI_INITIAL_ADMIN_EMAIL
      MONKEYAI_INITIAL_ADMIN_NAME: admin
      MONKEYAI_INITIAL_ADMIN_PASSWORD: $MONKEYAI_INITIAL_ADMIN_PASSWORD
      MONKEYAI_LOG_LEVEL: warn
      MONKEYAI_RUNTIME_RELAY: "true"
      MONKEYAI_RUNTIME_STATE_DIR: /app/runtime
      MONKEYAI_S3_ACCESS_KEY: $RUSTFS_ACCESS_KEY
      MONKEYAI_S3_SECRET_KEY: $RUSTFS_SECRET_KEY
      MONKEYAI_S3_BUCKET: monkeyai-resources
      MONKEYAI_S3_ENDPOINT: http://rustfs:9000
      MONKEYAI_S3_FORCE_PATH_STYLE: "true"
      MONKEYAI_S3_REGION: us-east-1
      NO_PROXY: localhost,127.0.0.1,::1,db,rustfs,backend
      TMPDIR: /app/import-tmp
    volumes:
      - license:/app/license
      - import-tmp:/app/import-tmp
      - runtime:/app/runtime
    healthcheck:
      <<: *healthcheck
      start_period: 90s
      test: ["CMD", "wget", "-Y", "off", "-q", "--spider", "http://127.0.0.1:8080/readyz"]
  db:
    image: chaitin-registry.cn-hangzhou.cr.aliyuncs.com/basic/postgres:18.6
    restart: unless-stopped
    environment:
      POSTGRES_DB: monkeyai
      POSTGRES_USER: monkeyai
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
    volumes:
      - postgres:/var/lib/postgresql
    healthcheck:
      interval: 5s
      retries: 10
      start_period: 10s
      timeout: 5s
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U $$POSTGRES_USER -d $$POSTGRES_DB"]
  migrate:
    image: $MONKEYAI_MIGRATE_IMAGE
    restart: "no"
    depends_on:
      db:
        condition: service_healthy
    command: ["-path=/migrations", "-database", *database-url, "up"]
  rustfs:
    image: chaitin-registry.cn-hangzhou.cr.aliyuncs.com/basic/rustfs:v1.0.0-rc.5
    user: "10001:10001"
    restart: unless-stopped
    depends_on:
      init-volumes:
        condition: service_completed_successfully
    environment:
      RUSTFS_ACCESS_KEY: $RUSTFS_ACCESS_KEY
      RUSTFS_SECRET_KEY: $RUSTFS_SECRET_KEY
      RUSTFS_CONSOLE_ENABLE: "false"
      RUSTFS_OBS_LOG_DIRECTORY: /logs
      RUSTFS_VOLUMES: /data
    volumes:
      - rustfs:/data
      - rustfs-logs:/logs
    healthcheck:
      interval: 5s
      retries: 20
      start_period: 20s
      timeout: 3s
      test: ["CMD", "curl", "-f", "http://127.0.0.1:9000/health"]
volumes:
  postgres:
  rustfs:
  rustfs-logs:
  runtime:
  license:
  import-tmp:
`,
          },
          domains: [
            { host: "$(EASYPANEL_DOMAIN)", service: "admin", port: 8080 },
          ],
        },
      },
    ],
  };
}
