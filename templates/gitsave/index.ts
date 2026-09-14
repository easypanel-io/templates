import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const jwtSecret = randomString(40);
  const encryptionSecret = randomString(32);

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
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "backups",
          mountPath: "/app/backups",
        },
      ],
      env: [
        `JWT_SECRET=${jwtSecret}`,
        `ENCRYPTION_SECRET=${encryptionSecret}`,
        `DISABLE_AUTH=${input.disableAuth}`,
      ].join("\n"),
    },
  });

  return { services };
}
