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
          port: 5656,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "kapowarr-db",
          mountPath: "/app/db",
        },
        {
          type: "volume",
          name: "kapowarr-downloads",
          mountPath: "/app/temp_downloads",
        },
        {
          type: "volume",
          name: "kapowarr-comics",
          mountPath: "/comics-1",
        },
      ],
    },
  });

  return { services };
} 