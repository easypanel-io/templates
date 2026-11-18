import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const setupToken = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `OPENTODO_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `OPENTODO_SETUP_TOKEN=${setupToken}`,
        `OPENTODO_ALLOW_SIGNUP=false`,
        `OPENTODO_TRUSTED_PROXIES=`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
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
