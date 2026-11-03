import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const dbPassword = randomPassword();
  const secretKey = randomString(64);

  const databaseYml = `production:
  adapter: postgresql
  encoding: unicode
  pool: 10
  host: $(PROJECT_NAME)_${input.appServiceName}-db
  port: 5432
  database: $(PROJECT_NAME)
  username: postgres
  password: ${dbPassword}
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
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
      env: [`SECRET_KEY_BASE=${secretKey}`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "app",
          mountPath: "/app",
        },
        {
          type: "file",
          content: databaseYml,
          mountPath: "/app/config/database.yml",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: dbPassword,
    },
  });

  return { services };
}
