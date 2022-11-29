import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `BASE_URL=https://${input.domain}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "cache",
          mountPath: "/var/cache/ntfy",
        },
        {
          type: "volume",
          name: "etc",
          mountPath: "/etc/ntfy",
        },
      ],
      deploy: {
        command: "ntfy serve",
      },
    },
  });

  return { services };
}
