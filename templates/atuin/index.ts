import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const dbHostname = `$(PROJECT_NAME)_${input.appServiceName}-db`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `ATUIN_HOST=0.0.0.0`,
        `ATUIN_PORT=8888`,
        `ATUIN_OPEN_REGISTRATION=${input.openRegistration}`,
        `ATUIN_DB_URI=postgresql://postgres:${dbPassword}@${dbHostname}:5432/$(PROJECT_NAME)`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8888,
        },
      ],
      deploy: {
        command: "/usr/local/bin/atuin-server start",
      },
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
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
