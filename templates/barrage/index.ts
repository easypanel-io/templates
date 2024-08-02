import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appkey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `NEXTAUTH_SECRET=${appkey}`,
        `NEXTAUTH_URL=https://$(PRIMARY_DOMAIN)`,
        `DELUGEURL=${input.delugeUrl}`,
        `DELUGE_PASSWORD=${input.delugePassword}`,
        `BARRAGE_PASSWORD=${input.barragePassword}`,
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
