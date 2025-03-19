import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appSecret = randomString(64);
  const apiKey = randomString(32);

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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/app/data",
        },
      ],
      env: [
        `USER=${input.serpUser}`,
        `PASSWORD=${input.serpPass}`,
        `SECRET=${appSecret}`,
        `APIKEY=${apiKey}`,
        `NEXT_PUBLIC_APP_URL=https://localhost:80`,
      ].join("\n"),
    },
  });

  return { services };
}
