import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `IMGPROXY_KEY=${randomString(18)}`,
        `IMGPROXY_SALT=${randomString(18)}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "darthsim/imgproxy",
      },
      proxy: {
        port: 8080,
        secure: true,
      },
    },
  });

  return { services };
}
