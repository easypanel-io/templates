import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        // Password-reset links and e-mails are built from APP_URL, scheme included.
        `APP_URL=https://$(PRIMARY_DOMAIN)`,
        // Sign-up closes on its own once the first account is created.
        `ALLOW_REGISTRATION=auto`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "database",
          mountPath: "/var/www/html/database",
        },
        {
          type: "volume",
          name: "storage",
          mountPath: "/var/www/html/storage",
        },
      ],
    },
  });

  return { services };
}
