import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [`USER_UID=1000`, `USER_GID=1000`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "bind",
          hostPath: "/etc/timezone",
          mountPath: "/etc/timezone",
        },
        {
          type: "bind",
          hostPath: "/etc/timezone",
          mountPath: "/etc/localtime",
        },
      ],
    },
  });

  if (input.databaseType === "mysql") {
    services.push({
      type: "mysql",
      data: {
        serviceName: `${input.appServiceName}-db`,
        password: databasePassword,
      },
    });
  } else if (input.databaseType === "postgres") {
    services.push({
      type: "postgres",
      data: {
        serviceName: `${input.appServiceName}-db`,
        password: databasePassword,
      },
    });
  }

  return { services };
}
