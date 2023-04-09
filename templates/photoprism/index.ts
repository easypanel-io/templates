import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const appEnv = [
    `PHOTOPRISM_ADMIN_USER=${input.photoprismAdminUser}`,
    `PHOTOPRISM_ADMIN_PASSWORD=${input.photoprismAdminPassword}`,
  ];

  if (input.databaseType === "mariadb") {
    appEnv.push(
      `PHOTOPRISM_DATABASE_DRIVER=mysql`,
      `PHOTOPRISM_DATABASE_NAME=${input.projectName}`,
      `PHOTOPRISM_DATABASE_SERVER=${input.projectName}_${input.databaseServiceName}:3306`,
      `PHOTOPRISM_DATABASE_USER=${input.databaseType}`,
      `PHOTOPRISM_DATABASE_PASSWORD=${databasePassword}`
    );

    services.push({
      type: input.databaseType,
      data: {
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: { port: 2342, secure: true },
      env: appEnv.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "originals",
          mountPath: "/photoprism/originals",
        },
        {
          type: "volume",
          name: "storage",
          mountPath: "/photoprism/storage",
        },
      ],
    },
  });

  return { services };
}
