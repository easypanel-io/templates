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
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 2368 }],
      mounts: [
        {
          type: "volume",
          name: "content",
          mountPath: "/var/lib/ghost/content",
        },
      ],
      env: [
        `url=https://$(PRIMARY_DOMAIN)`,
        `database__client=mysql`,
        `database__connection__host=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `database__connection__user=mysql`,
        `database__connection__password=${databasePassword}`,
        `database__connection__database=$(PROJECT_NAME)`,
      ].join("\n"),
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
