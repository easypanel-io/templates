import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `CLOUDCMD_ROOT=/mnt/fs`,
        `CLOUDCMD_AUTH=true`,
        `CLOUDCMD_USERNAME=${input.username}`,
        `CLOUDCMD_PASSWORD=${input.password}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: "/root",
          mountPath: "/root",
        },
        {
          type: "bind",
          hostPath: "/",
          mountPath: "/mnt/fs",
        },
      ],
    },
  });

  return { services };
}
