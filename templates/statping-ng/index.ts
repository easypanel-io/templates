import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseUsername = input.databaseType;

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DB_CONN=${input.databaseType}`,
        `DB_HOST=${input.projectName}_${input.databaseServiceName}`,
        `DB_USER=${databaseUsername}`,
        `DB_PASS=${databasePassword}`,
        `DB_DATABASE=${input.projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "adamboutcher/statping-ng:latest",
      },
      proxy: {
        port: 8080,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "app",
          mountPath: "/app",
        },
      ],
    },
  });

  if (input.databaseType === "postgres") {
    services.push({
      type: "postgres",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  if (input.databaseType === "mysql") {
    services.push({
      type: "mysql",
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        image: "mysql:5",
        password: databasePassword,
      },
    });
  }

  return { services };
}
