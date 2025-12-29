import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DEFAULT_THEME=dark`,
        `DEFAULT_THEME_COLOR=blue`,
        `SECRET_KEY=${secretKey}`,
        `HOST_NAME=$(PRIMARY_DOMAIN)`,
        `CSRF_COOKIE_SECURE=FALSE`,
        `SESSION_COOKIE_SECURE=FALSE`,
        `ALLOWED_HOSTS=$(PRIMARY_DOMAIN)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "sqlite-data",
          mountPath: "/home/nonroot/pdfding/db",
        },
        {
          type: "volume",
          name: "media",
          mountPath: "/home/nonroot/pdfding/media",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
    },
  });

  return { services };
}
