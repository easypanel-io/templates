import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `USER_CODE_PATH=/home/src/${input.projectName}`,
        `PROJECT_NAME=${input.projectName}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "mage start ${PROJECT_NAME}",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6789,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/home/src/",
        },
      ],
    },
  });

  return { services };
}
