import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  var value = "False";
  if (input.enableTLS) {
    value = "True";
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=Etc/UTC`,
        `SITE_ROOT=https://$(PRIMARY_DOMAIN)`,
        `SITE_NAME=`,
        `SUPERUSER_EMAIL=${input.superUsername}`,
        `SUPERUSER_PASSWORD=${input.superPassword}`,
        `ALLOWED_HOSTS=$(PRIMARY_DOMAIN)`,
        `APPRISE_ENABLED=False`,
        `CSRF_TRUSTED_ORIGINS=`,
        `DEBUG=True`,
        `DEFAULT_FROM_EMAIL=`,
        `EMAIL_HOST=${input.smtpHost}`,
        `EMAIL_PORT=${input.smtpPort}`,
        `EMAIL_HOST_USER=${input.smtpHostUser}`,
        `EMAIL_HOST_PASSWORD=${input.smtpHostPassword}`,
        `EMAIL_USE_TLS=${value}`,
        `INTEGRATIONS_ALLOW_PRIVATE_IPS=`,
        `PING_EMAIL_DOMAIN=`,
        `RP_ID=`,
        `SECRET_KEY=`,
        `SITE_LOGO_URL=`,
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
          name: "config",
          mountPath: "/config",
        },
      ],
    },
  });

  return { services };
}
