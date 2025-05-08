import { Output, Services, randomPassword, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const rootDatabasePassword = randomPassword();
  const secretKey = randomString(64);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `SECRET_KEY=${secretKey}`,
        `BEHIND_HTTPS_PROXY=true`,
        `CREATE_SUPERUSER=${input.adminUsername}:${input.adminPassword}`,
        `PORT=8000`,
        `DATABASE_URL=mysql://root:${rootDatabasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:3306/$(PROJECT_NAME)`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-db`,
      rootPassword: rootDatabasePassword,
    },
  });

  return { services };
} 