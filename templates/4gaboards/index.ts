import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKey = randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

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
          port: 1337,
        },
      ],
      env: [
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `SECRET_KEY=${secretKey}`,
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${`${input.appServiceName}-db`}:5432/$(PROJECT_NAME)`,
        `NODE_ENV=production`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "user-avatars",
          mountPath: "/app/public/user-avatars",
        },
        {
          type: "volume",
          name: "project-background-images",
          mountPath: "/app/public/project-background-images",
        },
        {
          type: "volume",
          name: "attachments",
          mountPath: "/app/private/attachments",
        },
      ],
    },
  });

  return { services };
}
