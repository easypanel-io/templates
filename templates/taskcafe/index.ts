import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();

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
          port: 3333,
        },
      ],
      env: [
        `TASKCAFE_DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `TASKCAFE_DATABASE_USER=postgres`,
        `TASKCAFE_DATABASE_PASSWORD=${dbPassword}`,
        `TASKCAFE_DATABASE_NAME=$(PROJECT_NAME)`,
        `TASKCAFE_MIGRATE=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/root/uploads",
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