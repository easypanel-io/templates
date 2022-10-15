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
      env: [
        `APP_URL=https://${input.domain}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_USER=mariadb`,
        `DB_PASS=${databasePassword}`,
        `DB_DATABASE=${input.projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "lscr.io/linuxserver/bookstack",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
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
