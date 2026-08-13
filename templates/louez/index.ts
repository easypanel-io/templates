import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const storagePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      // AUTH_SECRET is generated on first boot and persisted here, so sessions
      // survive redeploys without asking the operator for a secret.
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
      ],
      env: [
        `LOUEZ_MODE=standalone`,
        `DATABASE_URL=mysql://mysql:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:3306/$(PROJECT_NAME)`,
        `AUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `AUTH_TRUST_HOST=true`,
        `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXT_PUBLIC_APP_DOMAIN=$(PRIMARY_DOMAIN)`,
        // The bucket stays private: Louez streams images same-origin under
        // /files with its own credentials, so no public storage domain is set.
        `S3_ENDPOINT=http://$(PROJECT_NAME)_${input.storageServiceName}:9000`,
        `S3_REGION=us-east-1`,
        `S3_BUCKET=louez`,
        `S3_ACCESS_KEY_ID=louez`,
        `S3_SECRET_ACCESS_KEY=${storagePassword}`,
        `S3_PUBLIC_URL=/files`,
        // Optional: outgoing email. Louez runs without it (password sign-in).
        `SMTP_HOST=${input.smtpServerHost}`,
        `SMTP_PORT=${input.smtpServerPort}`,
        `SMTP_SECURE=${input.smtpServerSecure}`,
        `SMTP_USER=${input.smtpServerUsername}`,
        `SMTP_PASSWORD=${input.smtpServerPassword}`,
        `SMTP_FROM=${input.smtpFromEmail}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.storageServiceName,
      source: { type: "image", image: input.storageServiceImage },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      env: [
        `MINIO_ROOT_USER=louez`,
        `MINIO_ROOT_PASSWORD=${storagePassword}`,
      ].join("\n"),
      deploy: {
        // A bucket is a top-level directory of the data drive; creating it here
        // keeps the stack to three services instead of adding a one-shot job.
        command: `sh -c 'mkdir -p /data/louez && exec minio server /data'`,
      },
    },
  });

  return { services };
}
