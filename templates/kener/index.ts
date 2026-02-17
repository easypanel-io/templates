import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const kenerSecret = randomString(32);
  const databasePassword = randomPassword();

  const appEnv = [
    `TZ=${input.timezone}`,
    `KENER_SECRET_KEY=${kenerSecret}`,
    `ORIGIN=https://$(PRIMARY_DOMAIN)`,
  ];

  if (input.databaseType === "postgres") {
    appEnv.push(
      `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`
    );
  } else if (input.databaseType === "mysql") {
    appEnv.push(
      `DATABASE_URL=mysql://mysql:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:3306/$(PROJECT_NAME)`
    );
  }
  if (input.resendApiKey) {
    appEnv.push(`RESEND_API_KEY=${input.resendApiKey}`);
  }
  if (input.resendSenderEmail) {
    appEnv.push(`RESEND_SENDER_EMAIL=${input.resendSenderEmail}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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
          type: "volume",
          name: "database",
          mountPath: "/app/database",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/uploads",
        },
      ],
    },
  });

  // Add database service if not using SQLite
  if (input.databaseType === "postgres") {
    services.push({
      type: "postgres",
      data: {
        serviceName: `${input.appServiceName}-db`,
        password: databasePassword,
      },
    });
  } else if (input.databaseType === "mysql") {
    services.push({
      type: "mysql",
      data: {
        serviceName: `${input.appServiceName}-db`,
        password: databasePassword,
      },
    });
  }

  return { services };
}
