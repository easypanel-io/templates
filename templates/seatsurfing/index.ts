import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const jwtSecretKey = randomString(32);

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
          port: 8080,
        },
      ],
      env: [
        `POSTGRES_URL=postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db/$(PROJECT_NAME)?sslmode=disable`,
        `JWT_SIGNING_KEY=${jwtSecretKey}`,
        `BOOKING_UI_BACKEND=$(PROJECT_NAME)_${input.appServiceName}-booking:3001`,
        `ADMIN_UI_BACKEND=$(PROJECT_NAME)_${input.appServiceName}-admin:3000`,
        `PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
        `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-booking`,
      source: {
        type: "image",
        image: input.bookingServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-admin`,
      source: {
        type: "image",
        image: input.adminServiceImage,
      },
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
