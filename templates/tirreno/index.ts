import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbServiceName = `${input.appServiceName}-db`;
  const dbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DATABASE_URL=postgresql://postgres:${dbPassword}@$(PROJECT_NAME)_${dbServiceName}:5432/$(PROJECT_NAME)`,
        `SITE=$(PRIMARY_DOMAIN)`,
        `FORCE_HTTPS=${input.forceHttps ? "true" : "false"}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/html",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      password: dbPassword,
    },
  });

  return { services };
}
