import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const sshPort = input.sshPort;
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
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
          type: "volume",
          name: "backup",
          mountPath: "/backup",
        },
      ],
      ports: [
        {
          published: sshPort,
          target: 22,
        },
      ],
    },
  });

  if (input.databaseType === "mysql") {
    services.push({
      type: "mysql",
      data: {
        serviceName: `${input.appServiceName}-database`,
        password: databasePassword,
      },
    });
  } else if (input.databaseType === "postgres") {
    services.push({
      type: "postgres",
      data: {
        serviceName: `${input.appServiceName}-database`,
        password: databasePassword,
      },
    });
  }

  return { services };
}
