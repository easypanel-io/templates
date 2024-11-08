import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `ADMINMAIL=${input.adminEmail}`,
        `ADMINPASS=${input.adminPassword}`,
        `DATABASE_URL=mysql://mysql:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}/$(PROJECT_NAME)?charset=utf8mb4&serverVersion=8.3.0`,
        `TRUSTED_HOSTS=nginx,localhost,127.0.0.1,$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/kimai/var/data",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
