import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 80, secure: true },
      domains: input.domain ? [{ name: input.domain }] : [],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/var/www/config",
        },
        {
          type: "volume",
          name: "log",
          mountPath: "/var/log/ampache",
        },
        {
          type: "volume",
          name: "mysql",
          mountPath: "/var/lib/mysql",
        },
        {
          type: "bind",
          hostPath: input.appMediaHostPath,
          mountPath: "/media",
        },
      ],
    },
  });

  return { services };
}
