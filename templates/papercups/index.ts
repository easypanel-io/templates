import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(128);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)?sslmode=disable`,
        `SECRET_KEY_BASE=${secret}`,
        `BACKEND_URL=localhost`,
        `MIX_ENV=prod`,
        `REQUIRE_DB_SSL=false`,
        `REACT_APP_FILE_UPLOADS_ENABLED=1`,
        `REACT_APP_URL=$(PRIMARY_DOMAIN)`,
      ].join("\n"),
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
      deploy: {
        command:
          "sh -c 'sleep 10 && /entrypoint.sh db createdb && /entrypoint.sh db migrate && echo 'running' && /entrypoint.sh run'",
      },
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
