import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `APP_FULL_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `DATASOURCES_DEFAULT_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DATASOURCES_DEFAULT_USERNAME=mysql`,
        `DATASOURCES_DEFAULT_PASSWORD=${databasePassword}`,
        `DATASOURCES_DEFAULT_DATABASE=$(PROJECT_NAME)`,
        `PASSBOLT_REGISTRATION_PUBLIC=false`,
        `PASSBOLT_SSL_FORCE=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "sleep 10 && /docker-entrypoint.sh",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "gpg",
          mountPath: "/etc/passbolt/gpg",
        },
        {
          type: "volume",
          name: "jwt",
          mountPath: "/etc/passbolt/jwt",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
