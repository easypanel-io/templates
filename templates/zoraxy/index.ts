import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: ["FASTGEOIP=true"].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/opt/zoraxy/config/",
        },
        {
          type: "volume",
          name: "plugin",
          mountPath: "/opt/zoraxy/plugin/",
        },
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "bind",
          hostPath: "/etc/localtime",
          mountPath: "/etc/localtime",
        },
      ],
    },
  });

  return { services };
}
