import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const encryptionKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PBW_ENCRYPTION_KEY=${encryptionKey}`,
        `PBW_POSTGRES_CONN_STRING=${input.connectionString}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8085,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "backups",
          mountPath: "/backups",
        },
      ],
    },
  });

  return { services };
}
