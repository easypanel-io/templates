import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

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
          port: 8080,
        },
      ],
      env: [
        `DATABASE_NAME=data.db`,
        `INIT_GROUP=${input.initGroup}`,
        `INIT_PASSWORD=${input.initPassword}`,
        `INIT_USER=${input.initUser}`,
        `SUBPATH=`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "zusam-data",
          mountPath: "/zusam/data",
        },
      ],
    },
  });

  return { services };
}
