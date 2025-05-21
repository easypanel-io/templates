import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: `${input.appServiceImage}${
          input.enableArm ? "-arm64" : "-amd64"
        }`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 11235,
        },
      ],
    },
  });

  return { services };
}
