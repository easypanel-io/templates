import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const jwtSecret = randomString(32);
  const userSecret = randomString(32);
  const loginPassword = input.loginPassword || randomPassword();

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `JWT_SECRET=${jwtSecret}`,
        `USER_SECRET=${userSecret}`,
        `LOGIN_USERNAME=${input.loginUsername}`,
        `LOGIN_PASSWORD=${loginPassword}`,
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.webServiceImage,
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
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-agent`,
      env: [
        `DATABASE_URL=postgresql://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.agentServiceImage,
      },
    },
  });

  return { services };
}
