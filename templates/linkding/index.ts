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
      `LD_DB_DATABASE=$(PROJECT_NAME)`,
      `LD_DB_USER=postgres`,
      `LD_DB_PASSWORD=${databasePassword}`,
      `LD_DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
      `LD_DB_PORT=5432`
    );

    services.push({
      type: "postgres",
      data: {
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: appEnv.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9090,
        },
      ],
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
