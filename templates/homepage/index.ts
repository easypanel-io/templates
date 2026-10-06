import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const authEnv = input.authPassword
    ? [
        "HOMEPAGE_AUTH_ENABLED=true",
        `HOMEPAGE_AUTH_SECRET=${randomString(32)}`,
        "HOMEPAGE_EXTERNAL_URL=https://$(PRIMARY_DOMAIN)",
        `HOMEPAGE_AUTH_PASSWORD=${input.authPassword}`,
      ]
    : [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        // Required since v2 - requests with an unrecognized Host header are
        // rejected with 400 Host validation failed.
        "HOMEPAGE_ALLOWED_HOSTS=$(PRIMARY_DOMAIN)",
        ...authEnv,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/app/config",
        },
      ],
    },
  });

  return { services };
}
