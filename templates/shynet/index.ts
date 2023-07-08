import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(64);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DB_NAME=$(PROJECT_NAME)`,
        `DB_USER=postgres`,
        `DB_PASSWORD=${databasePassword}`,
        `DB_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `DB_PORT=5432`,
        `DJANGO_SECRET_KEY=${secret}`,
        `ALLOWED_HOSTS=$(PRIMARY_DOMAIN)`,
        `CSRF_TRUSTED_ORIGINS=https://$(PRIMARY_DOMAIN)`,
        `LANGUAGE_CODE=en-us`, // required to boot
        `ACCOUNT_SIGNUPS_ENABLED=False`,
        `TIME_ZONE=America/New_York`, // required to boot
        `ACCOUNT_EMAIL_VERIFICATION=none`,
        `SCRIPT_USE_HTTPS=True`,
        `SCRIPT_HEARTBEAT_FREQUENCY=5000`,
        `SESSION_MEMORY_TIMEOUT=1800`,
        `ONLY_SUPERUSERS_CREATE=True`,
        `SHOW_SHYNET_VERSION=True`,
        `SHOW_THIRD_PARTY_ICONS=True`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
