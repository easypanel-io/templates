import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const appSecret = randomString(32);

  const databaseUrl = `mysql://mysql:${dbPassword}@$(PROJECT_NAME)_${input.appServiceName}-db:3306/$(PROJECT_NAME)`;

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
          port: 8765,
        },
      ],
      env: [
        `SOLIDINVOICE_ENV=prod`,
        `SOLIDINVOICE_DEBUG=0`,
        `SOLIDINVOICE_APP_SECRET=${appSecret}`,
        `SOLIDINVOICE_DATABASE_URL=${databaseUrl}`,
        `SOLIDINVOICE_CONFIG_DIR=/etc/solidinvoice`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/etc/solidinvoice",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  return { services };
}
