import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const npAuthSalt = randomString();
  const npAuthPassword = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=file:../../.data/dev.db`,
        `NP_AUTH_SALT=${npAuthSalt}`,
        `NP_AUTH_PASSWORD=${npAuthPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/admin",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/.data",
        },
      ],
    },
  });

  return { services };
}
