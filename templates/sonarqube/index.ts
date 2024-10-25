import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databaseRandomPassword = randomPassword();

  const serviceVariables = [
    `SONAR_JDBC_URL=jdbc:postgresql://$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
    `SONAR_JDBC_USERNAME=postgres`,
    `SONAR_JDBC_PASSWORD=${databaseRandomPassword}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: serviceVariables.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9000,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databaseRandomPassword,
    },
  });

  return { services };
}
