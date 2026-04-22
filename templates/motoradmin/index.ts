import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const secretKey = randomString(64);

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
        `SECRET_KEY_BASE=${secretKey}`,
        `DATABASE_URL=postgresql://postgres:${dbPassword}@$(PROJECT_NAME)-${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "app",
          mountPath: "/app",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  return { services };
}
