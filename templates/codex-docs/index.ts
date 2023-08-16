import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();
  const secret = randomString();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `APP_CONFIG_database_driver=mongodb`,
        `APP_CONFIG_database_mongodb_uri=mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.databaseServiceName}:27017`,
        `APP_CONFIG_auth_password=${input.codexAuthPassword}`,
        `APP_CONFIG_auth_secret=${secret}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "uploads",
          mountPath: "/usr/src/app/uploads",
        },
        {
          type: "volume",
          name: "db",
          mountPath: "/usr/src/app/db",
        },
        {
          type: "file",
          content: [
            "# Custom Config, view Here https://github.com/codex-team/codex.docs/blob/main/docs-config.yaml",
            "# Can Also Be configured with ENV, see here https://docs.codex.so/configuration#override-properties-with-environment-variables",
          ].join("\n"),
          mountPath: "/usr/src/app/docs-config.yaml",
        },
      ],
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: mongoPassword,
    },
  });

  return { services };
}
