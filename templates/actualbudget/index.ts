import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appkey = randomString(32);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 5006,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
