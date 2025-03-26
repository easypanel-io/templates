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
        `NODE_ENV=production`,
        `TRUDESK_DOCKER=true`,
        `TD_MONGODB_URI=mongodb://mongo:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:27017/?tls=false`,
        `USE_XFORWARDIP=true`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8118,
        },
      ],
    },
  });

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
