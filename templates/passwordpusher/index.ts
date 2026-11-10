import { randomBytes } from "crypto";
import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKeyBase = randomBytes(64).toString("hex");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgres:///$(PROJECT_NAME)?host=$(PROJECT_NAME)_${input.appServiceName}-db&port=5432&user=postgres&password=${databasePassword}`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5100,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
