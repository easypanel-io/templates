import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const serviceVariables = [
    `WG_HOST=${input.appDomain}`,
    `PASSWORD=${input.appPassword}`,
  ];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: serviceVariables.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 50921,
        secure: true,
      },
      ports: [
        {
          protocol: "udp",
          published: 50920,
          target: 50920,
        },
      ],
      domains: [
        {
          name: input.appDomain,
        },
      ],
    },
  });

  return { services };
}
