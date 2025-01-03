import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `INVIDIOUS_CONFIG =
          'db:\r\n  dbname: $(PROJECT_NAME)\r\n  user: postgres\r\n  password: ${databasePassword}\r\n  host: $(PROJECT_NAME)_${input.appServiceName}-db\r\n  port: 5432\r\ncheck_tables: true\r\ndomain: "https://$(PRIMARY_DOMAIN)/"\r\nport: 3000\r\nhmac_key: "wV7Yb76K3kL8QnKZ1Z72n0gGx1F5F8a9V1J7X0Y3Y1M="'`,
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
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
