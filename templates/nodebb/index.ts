import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4567,
        },
      ],
      env: [
        `SETUP=1`,
        `NODEBB_URL=https://$(PRIMARY_DOMAIN)`,
        `NODEBB_ADMIN_EMAIL=${input.nodebbAdminMail || "admin@example.com"}`,
        `NODEBB_ADMIN_USERNAME=${input.nodebbAdminUsername || "admin"}`,
        `NODEBB_ADMIN_PASSWORD=${
          input.nodebbAdminPassword || randomPassword()
        }`,
        `NODEBB_DB=${input.databaseServiceType}`,
        `NODEBB_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `NODEBB_DB_USER=${
          input.databaseServiceType === "redis"
            ? "default"
            : input.databaseServiceType
        }`,
        `NODEBB_DB_PASSWORD=${databasePassword}`,
        `NODEBB_DB_NAME=${
          input.databaseServiceType === "mongo"
            ? "admin"
            : input.databaseServiceType === "redis"
            ? 0
            : "$(PROJECT_NAME)"
        }`,
      ].join("\n"),
      mounts: [{ type: "volume", name: "app", mountPath: "/usr/src/app" }],
    },
  });

  services.push({
    type: input.databaseServiceType,
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
