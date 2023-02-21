import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(32);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `JWT_SECRET=${secret}`,
      ].join("\n"),
      proxy: {
        port: 3000,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/assets",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
