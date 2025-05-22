import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const postgresPassword = randomPassword();
  const nextAuthSecret = randomString(32);
  const encryptionKey = randomString(64);
  const encryptionSecondaryKey = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-web`,
      env: [
        `NEXTAUTH_SECRET=${nextAuthSecret}`,
        `NEXT_PRIVATE_ENCRYPTION_KEY=${encryptionKey}`,
        `NEXT_PRIVATE_ENCRYPTION_SECONDARY_KEY=${encryptionSecondaryKey}`,
        `NEXT_PUBLIC_WEBAPP_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXT_PRIVATE_INTERNAL_WEBAPP_URL=http://localhost:3000`,
        `NEXT_PRIVATE_DATABASE_URL=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/postgres?sslmode=disable`,
        `NEXT_PRIVATE_DIRECT_DATABASE_URL=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/postgres?sslmode=disable`,
        `NEXT_PRIVATE_SMTP_TRANSPORT=smtp-auth`,
        `NEXT_PRIVATE_SMTP_HOST=${input.smtpHost}`,
        `NEXT_PRIVATE_SMTP_PORT=${input.smtpPort}`,
        `NEXT_PRIVATE_SMTP_USERNAME=${input.smtpUsername}`,
        `NEXT_PRIVATE_SMTP_PASSWORD=${input.smtpPassword}`,
        `NEXT_PRIVATE_SMTP_FROM_NAME=${input.smtpFromName}`,
        `NEXT_PRIVATE_SMTP_FROM_ADDRESS=${input.smtpFromAddress}`,
        `NEXT_PUBLIC_UPLOAD_TRANSPORT=database`,
        `NEXT_PRIVATE_SIGNING_TRANSPORT=local`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/keys/cert.p12`,
          mountPath: "/opt/documenso/cert.p12",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: postgresPassword,
    },
  });

  return { services };
}
