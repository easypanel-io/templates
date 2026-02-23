import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `JWT_SECRET=${secretKey}`,
        `ACCOUNT_REGISTRATION=true`,
        `HTTP_ALLOWED=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  return { services };
}
