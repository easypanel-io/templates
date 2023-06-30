import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `POSTGRES_PASSWORD=${input.postgresPassword}`,
        `POSTGRES_HOST_AUTH_METHOD=trust`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        replicas: 1,
        command: "",
        zeroDowntime: true,
      },
      proxy: {
        port: 80,
        secure: true,
      },
    },
  });

  return { services };
}
