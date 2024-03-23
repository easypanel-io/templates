import { Output, Services, randomPassword } from "~templates-utils";
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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80
        }
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data"
        },
        {
          type: "volume",
          name: "conf",
          mountPath: "/conf"
        },
      ]
    }
  });

  services.push({
    type: "mariadb",
    data: {
      projectName: input.projectName,
      serviceName: input.dbServiceName,
      image: input.dbServiceImage,
      password: databasePassword,
    },
  });

  return { services };
}
