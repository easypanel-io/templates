import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const appEnv = [
    `LD_DB_ENGINE=${input.databaseType}`,
    `LD_SUPERUSER_NAME=${input.linkdingSuperuserName}`,
    `LD_SUPERUSER_PASSWORD=${input.linkdingSuperuserPassword}`,
    `LD_DISABLE_BACKGROUND_TASKS=${input.linkdingDisableBackgroundTasks}`,
    `LD_DISABLE_URL_VALIDATION=${input.linkdingDisableURLValidation}`,
  ];

  if (input.databaseType === "postgres") {
    appEnv.push(
      `LD_DB_DATABASE=${input.projectName}`,
      `LD_DB_USER=postgres`,
      `LD_DB_PASSWORD=${databasePassword}`,
      `LD_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
      `LD_DB_PORT=5432`
    );

    services.push({
      type: "postgres",
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
      source: { type: "image", image: input.appServiceImage },
      env: appEnv.join("\n"),
      proxy: { port: 9090, secure: true },
      domains: input.domain ? [{ name: input.domain }] : [],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/etc/linkding/data",
        },
      ],
    },
  });

  return { services };
}
