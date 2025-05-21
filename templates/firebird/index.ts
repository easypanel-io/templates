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
      env: [
        `FIREBIRD_ROOT_PASSWORD=${input.rootPassword}`,
        `FIREBIRD_USER=${input.dbUser}`,
        `FIREBIRD_PASSWORD=${input.dbPassword}`,
        `FIREBIRD_DATABASE=mirror.fdb`,
        `FIREBIRD_DATABASE_DEFAULT_CHARSET=UTF8`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3050,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/firebird/data",
        },
      ],
    },
  });

  return { services };
}
