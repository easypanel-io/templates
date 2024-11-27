import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `TRAGGO_DEFAULT_USER_NAME=${input.traggoUsername}`,
        `TRAGGO_DEFAULT_USER_PASS=${input.traggoPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 3030,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "traggodata",
          mountPath: "/opt/traggo/data",
        },
      ],
    },
  });

  return { services };
}
