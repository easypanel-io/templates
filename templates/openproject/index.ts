import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [
    `OPENPROJECT_SECRET_KEY_BASE=${randomString(64)}`,
    `OPENPROJECT_HTTPS=true`,
    `OPENPROJECT_HOST__NAME=$(PRIMARY_DOMAIN)`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/var/openproject/assets",
        },
        {
          type: "volume",
          name: "pgdata",
          mountPath: "/var/openproject/pgdata",
        },
      ],
    },
  });

  return { services };
}
