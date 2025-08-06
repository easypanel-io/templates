import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSecret = randomString(32);
  const githubEncryptionKey = randomString(32);
  const analyticsSalt = randomString(32);
  const postgresPassword = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-postgres`,
      password: postgresPassword,
    },
  });

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
          port: 3000,
        },
      ],
      env: [
        `DATABASE_URL=postgresql://postgres:${postgresPassword}@$(PROJECT_NAME)_${input.appServiceName}-postgres:5432/$(PROJECT_NAME)?schema=public`,
        `JWT_ACCESS_SECRET=${jwtSecret}`,
        `NEXT_PUBLIC_APP_URL=https://$(PRIMARY_DOMAIN)`,
        `GITHUB_ENCRYPTION_KEY=${githubEncryptionKey}`,
        `ANALYTICS_SALT=${analyticsSalt}`,
        "NODE_ENV=production",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/uploads",
        },
        {
          type: "volume",
          name: "public-generated",
          mountPath: "/app/public/generated",
        },
      ],
    },
  });

  return { services };
}
