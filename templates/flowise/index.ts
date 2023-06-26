import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const username = input.username;
  const password = input.password;

  const serviceVariables = [
    `env: FLOWISE_USERNAME=${username}\nFLOWISE_PASSWORD=${password}`,
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
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/.root/flowise",
        },
      ],
      deploy: {
        replicas: 1,
        command: "sleep 3; flowise start",
        zeroDowntime: true,
      },
      domains: [
        {
          name: input.appDomain,
        },
      ],
    },
  });

  return { services };
}
