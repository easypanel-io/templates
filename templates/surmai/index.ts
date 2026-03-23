import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const adminPassword = randomPassword();

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
          port: 8080,
        },
      ],
      env: [
        `SURMAI_ADMIN_EMAIL=${input.adminEmail}`,
        `SURMAI_ADMIN_PASSWORD=${adminPassword}`,
        `PB_DATA_DIRECTORY=/pb_data`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/pb_data",
        },
      ],
    },
  });

  return { services };
}
