import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const adminPassword = input.adminPassword || randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `ZO_ROOT_USER_EMAIL=${input.adminEmail}`,
        `ZO_ROOT_USER_PASSWORD=${adminPassword}`,
        `ZO_DATA_DIR=/data`,
        `ZO_LOCAL_MODE=true`,
        `ZO_LOCAL_MODE_STORAGE=disk`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
