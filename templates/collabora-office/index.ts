import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 9980 }],
      env: [
        `domain=$(PRIMARY_DOMAIN)`,
        `username=${input.appUsername}`,
        `password=${input.appPassword}`,
        `extra_params=--o:ssl.enable=false`,
      ].join("\n"),
    },
  });

  return { services };
}
