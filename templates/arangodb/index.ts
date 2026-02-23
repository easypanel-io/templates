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
      env: [`ARANGO_ROOT_PASSWORD=${databasePassword}`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8529,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/arangodb3",
        },
      ],
    },
  });

  return { services };
}
