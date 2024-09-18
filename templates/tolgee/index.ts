import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(256);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `spring_datasource_url=jdbc:postgresql://$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `spring_datasource_username=postgres`,
        `spring_datasource_password=${databasePassword}`,
        `tolgee_rate-limits=false`,
        `tolgee_authentication_initial-username=${input.userUsername}`,
        `tolgee_authentication_initial-password=${input.userPassword}`,
        `tolgee_postgres-autostart_enabled=false`,
        `tolgee_authentication_enabled=true`,
        `tolgee_registrations_allowed=false`,
        `tolgee_max-translation-text-length=10000`,
        `tolgee_max-upload-file-size=2048`, // in bytes
        `tolgee_max-screenshots-per-key=20`,
        `tolgee_authentication_needs-email-verification=false`,
        `tolgee_authentication_jwt-secret=${secret}`,
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
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
