import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const mongoPassword = randomPassword();
  const secretKey = randomString(32);
  const dbServiceName = `${input.appServiceName}-db`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `URL=https://$(PRIMARY_DOMAIN)`,
        `SECRET_KEY=${secretKey}`,
        `MONGODB_URI=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${dbServiceName}:27017/composecraft?authSource=admin`,
        `CORE_ONLY=true`,
        `DISABLE_TELEMETRY=true`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: dbServiceName,
      password: mongoPassword,
    },
  });

  return { services };
}
