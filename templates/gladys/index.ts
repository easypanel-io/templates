import {
    Output,
    Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env = [
    `NODE_ENV=production`,
    `SQLITE_FILE_PATH=/var/lib/gladysassistant/gladys-production.db`,
    `SERVER_PORT=8080`,
    `TZ=${input.timezone}`,
  ];

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
      env: env.join("\n"),
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/gladysassistant",
        },
        {
          type: "bind",
          hostPath: "/dev",
          mountPath: "/dev",
        },
        {
          type: "bind",
          hostPath: "/run/udev",
          mountPath: "/run/udev",
        },
      ],
      deploy: {
        capAdd: [
          "SYS_ADMIN",
          "NET_ADMIN",
          "SYS_RAWIO",
          "SYS_TIME",
        ],
      },
    },
  });

  return { services };
}
