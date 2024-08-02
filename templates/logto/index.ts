import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const randomPasswordPostgres = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `TRUST_PROXY_HEADER=1`,
        `DB_URL=postgres://postgres:${randomPasswordPostgres}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`,
        `ENDPOINT=https://$(EASYPANEL_DOMAIN)`,
        `ADMIN_ENDPOINT=https://admin-$(EASYPANEL_DOMAIN)`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: `$(EASYPANEL_DOMAIN)`,
          port: 80,
        },
        {
          host: `admin-$(EASYPANEL_DOMAIN)`,
          port: 3002,
        },
      ],
      deploy: {
        command: "npm run cli db seed -- --swe && npm start",
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      image: "postgres:16",
      password: randomPasswordPostgres,
    },
  });

  return { services };
}
