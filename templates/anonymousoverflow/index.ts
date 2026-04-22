import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const jwtSigningSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
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
      env: [
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        `JWT_SIGNING_SECRET=${jwtSigningSecret}`,
      ].join("\n"),
    },
  });

  return { services };
}
