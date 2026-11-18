import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const password = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `ARGUS_WEB_BASIC_AUTH_USERNAME=admin`,
        `ARGUS_WEB_BASIC_AUTH_PASSWORD=${password}`,
      ].join("\n"),
      deploy: {
        command: [
          "[ -f /app/data/config.yml ] || printf 'settings:\\n  web:\\n    trusted_proxies:\\n      - 10.0.0.0/8\\nservice: {}\\n' > /app/data/config.yml",
          "chown 911:911 /app/data/config.yml",
          "exec /entrypoint.sh -config.file=/app/data/config.yml",
        ].join(" && "),
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
          mountPath: "/app/data",
        },
      ],
    },
  });

  return { services };
}
