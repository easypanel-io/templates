import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        "MINIO_SERVER_URL=https://$(EASYPANEL_DOMAIN)",
        `MINIO_ROOT_USER=${input.username}`,
        `MINIO_ROOT_PASSWORD=${input.password}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
      domains: [
        {
          host: "console.$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
      deploy: {
        command: `minio server /data --console-address ":9001"`,
      },
    },
  });

  return { services };
}
