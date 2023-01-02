import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [`TZ=${input.serviceTimezone}`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 5000,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/kavita/config",
        },
        {
          type: "volume",
          name: "manga",
          mountPath: "/manga",
        },
        {
          type: "volume",
          name: "comics",
          mountPath: "/comics",
        },
        {
          type: "volume",
          name: "books",
          mountPath: "/books",
        },
      ],
    },
  });

  return { services };
}
