import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: "kanboard/kanboard:latest" },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/app/data",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/var/www/app/plugins",
        },
        {
          type: "volume",
          name: "ssl",
          mountPath: "/etc/nginx/ssl",
        },
      ],
      proxy: { port: 80 },
    },
  });

  return { services };
}
