import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [`LAVALINK_SERVER_PASSWORD=${input.password}`].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 2333,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "lavalink",
          mountPath: "/opt/Lavalink",
        },
      ],
    },
  });

  return { services };
}
