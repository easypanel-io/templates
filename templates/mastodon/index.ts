import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const crypto = require("crypto");
  const ecdh = crypto.createECDH("prime256v1");
  ecdh.generateKeys();

  const appEnv = [
    `LOCAL_DOMAIN=$(PRIMARY_DOMAIN)`,
    `REDIS_HOST=$(PROJECT_NAME)_${input.appServiceName}-redis`,
    `REDIS_PASSWORD=${redisPassword}`,
    `REDIS_PORT=6379`,
    `DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DB_USER=postgres`,
    `DB_NAME=$(PROJECT_NAME)`,
    `DB_PASS=${databasePassword}`,
    `DB_PORT=5432`,
    `ES_ENABLED=false`,
    `ES_HOST=localhost`,
    `ES_PORT=9200`,
    `ES_USER=elastic`,
    `ES_PASS=password`,
    `SECRET_KEY_BASE=${randomString(64)}`,
    `OTP_SECRET=${randomString(64)}`,
    `VAPID_PRIVATE_KEY=${ecdh.getPrivateKey("base64")}`,
    `VAPID_PUBLIC_KEY=${ecdh.getPublicKey("base64")}`,
    `SMTP_SERVER=${input.smtpServer || ""}`,
    `SMTP_PORT=${input.smtpPort || 587}`,
    `SMTP_LOGIN=${input.smtpLogin || ""}`,
    `SMTP_PASSWORD=${input.smtpPassword || ""}`,
    `SMTP_FROM_ADDRESS=${input.smtpFromAddress || "notifications@example.com"}`,
    `S3_ENABLED=false`,
    `S3_BUCKET=files.example.com`,
    `AWS_ACCESS_KEY_ID=`,
    `AWS_SECRET_ACCESS_KEY=`,
    `S3_ALIAS_HOST=files.example.com`,
    `IP_RETENTION_PERIOD=31556952`,
    `SESSION_RETENTION_PERIOD=31556952`,
  ];

  if (input.enableStreaming) {
    appEnv.push(`STREAMING_API_BASE_URL=https://$(PRIMARY_DOMAIN)`);
    services.push({
      type: "app",
      data: {
        serviceName: input.appServiceName + "-streaming",
        source: { type: "image", image: input.appServiceImage },
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 4000,
          },
        ],
        env: appEnv.join("\n"),
        deploy: { command: `node ./streaming` },
      },
    });
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName + "-web",
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: appEnv.join("\n"),
      deploy: {
        command: `bash -c "bundle exec rails db:migrate; bundle exec rails db:seed; rm -f /mastodon/tmp/pids/server.pid; bundle exec rails s -p 3000"`,
      },
      mounts: [
        {
          type: "volume",
          name: "public",
          mountPath: "/mastodon/public",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName + "-sidekiq",
      source: { type: "image", image: input.appServiceImage },
      env: appEnv.join("\n"),
      deploy: { command: `bundle exec sidekiq` },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}-web/volumes/public`,
          mountPath: "/mastodon/public",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.appServiceName + "-db",
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: input.appServiceName + "-redis",
      password: redisPassword,
    },
  });

  return { services };
}
