import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

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
          port: 1883,
        },
      ],
      mounts: [
        {
          type: "file",
          mountPath: "/mosquitto/config/mosquitto.conf",
          content: `
            persistence true
            persistence_location /mosquitto/data
            log_dest file /mosquitto/log/mosquitto.log
          `.trim(),
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/mosquitto/data",
        },
        {
          type: "volume",
          name: "log",
          mountPath: "/mosquitto/log",
        },
      ],
    },
  });

  return { services };
}
