import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const session_secret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `extensions_authentication_admin_username=${input.username}`,
        `extensions_authentication_admin_password=${input.password}`,
        `extensions_authentication_cookieSession_secret=${session_secret}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5488,
        },
      ],
    },
  });

  return { services };
}
