import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URI=${input.databaseType}://${input.dbUsername}:${input.dbPassword}@${input.dbHostname}:${input.dbPort}/${input.dbName}`,
        `JWT_KEY=${input.jwtSecret}`,
        `DOMAIN=$(PRIMARY_DOMAIN)`,
        `SOFT_DELETE_COLUMN=deletedAt`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  return { services };
}
