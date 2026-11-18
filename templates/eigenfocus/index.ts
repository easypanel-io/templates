import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const authPassword = randomString(20);
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DEFAULT_HOST_URL=https://$(PRIMARY_DOMAIN)`,
        `FORCE_SSL=true`,
        `ASSUME_SSL_REVERSE_PROXY=true`,
        `HTTP_AUTH_USER=admin`,
        `HTTP_AUTH_PASSWORD=${authPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "app-data",
          mountPath: "/eigenfocus-app/app-data",
        },
      ],
    },
  });

  return { services };
}
