import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [`RELAY_HOST=${input.relayHost}`,
      `RELAY_PORT=${input.relayPort}`,
      `RELAY_USERNAME=${input.relayUsername}`,
      `RELAY_PASSWORD=${input.relayPassword}`
    ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 25,
        secure: true,
      },
    },
  });

  return { services };
}
