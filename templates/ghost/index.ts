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
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `url=https://${input.domain}`,
        `database__client=mysql`,
        `database__connection__host=${input.projectName}_${input.databaseServiceName}`,
        `database__connection__user=mariadb`,
        `database__connection__password=${databasePassword}`,
        `database__connection__database=${input.projectName}`,
      ].join("\n"),
      proxy: {
        port: 2368,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "content",
          mountPath: "/var/lib/ghost/content",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
