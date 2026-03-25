import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databasePassword = randomPassword();
  const apiEncryptionKey = input.apiEncryptionKey || randomString(64);
  const betterAuthSecret = input.betterAuthSecret || randomString(32);

  const serverEnv = [
    `SPARKY_FITNESS_LOG_LEVEL=${input.logLevel}`,
    `ALLOW_PRIVATE_NETWORK_CORS=${input.allowPrivateNetworkCors}`,
    `SPARKY_FITNESS_DB_USER=postgres`,
    `SPARKY_FITNESS_DB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `SPARKY_FITNESS_DB_NAME=$(PROJECT_NAME)`,
    `SPARKY_FITNESS_DB_PASSWORD=${databasePassword}`,
    `SPARKY_FITNESS_APP_DB_USER=postgres`,
    `SPARKY_FITNESS_APP_DB_PASSWORD=${databasePassword}`,
    `SPARKY_FITNESS_DB_PORT=5432`,
    `SPARKY_FITNESS_API_ENCRYPTION_KEY=${apiEncryptionKey}`,
    `BETTER_AUTH_SECRET=${betterAuthSecret}`,
    `SPARKY_FITNESS_FRONTEND_URL=https://$(PROJECT_NAME)-${input.appServiceName}-frontend.$(EASYPANEL_HOST)`,
    `SPARKY_FITNESS_DISABLE_SIGNUP=${input.disableSignup}`,
    `SPARKY_FITNESS_FORCE_EMAIL_LOGIN=${input.forceEmailLogin}`,
  ];

  if (input.adminEmail) {
    serverEnv.push(`SPARKY_FITNESS_ADMIN_EMAIL=${input.adminEmail}`);
  }

  if (input.emailHost) {
    serverEnv.push(`SPARKY_FITNESS_EMAIL_HOST=${input.emailHost}`);
    if (input.emailPort) {
      serverEnv.push(`SPARKY_FITNESS_EMAIL_PORT=${input.emailPort}`);
    }
    if (input.emailSecure !== undefined) {
      serverEnv.push(`SPARKY_FITNESS_EMAIL_SECURE=${input.emailSecure}`);
    }
    if (input.emailUser) {
      serverEnv.push(`SPARKY_FITNESS_EMAIL_USER=${input.emailUser}`);
    }
    if (input.emailPass) {
      serverEnv.push(`SPARKY_FITNESS_EMAIL_PASS=${input.emailPass}`);
    }
    if (input.emailFrom) {
      serverEnv.push(`SPARKY_FITNESS_EMAIL_FROM=${input.emailFrom}`);
    }
  }

  if (input.extraTrustedOrigins) {
    serverEnv.push(
      `SPARKY_FITNESS_EXTRA_TRUSTED_ORIGINS=${input.extraTrustedOrigins}`
    );
  }

  const frontendEnv = [
    `SPARKY_FITNESS_FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
    `SPARKY_FITNESS_SERVER_HOST=$(PROJECT_NAME)_${input.appServiceName}-server`,
    `SPARKY_FITNESS_SERVER_PORT=3010`,
  ];

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      source: {
        type: "image",
        image: input.serverImage,
      },
      env: serverEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "backups",
          mountPath: "/app/SparkyFitnessServer/backup",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/SparkyFitnessServer/uploads",
        },
      ],
      ports: [
        {
          published: 3010,
          target: 3010,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-frontend`,
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
      env: frontendEnv.join("\n"),
    },
  });

  return { services };
}
