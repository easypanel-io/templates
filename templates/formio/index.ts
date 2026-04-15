import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mongoPassword = randomPassword();

  services.push({
    type: "mongo",
    data: {
      serviceName: `${input.appServiceName}-mongo`,
      password: mongoPassword,
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DEBUG=formio:*`,
        `NODE_CONFIG={"mongo": "mongodb://mongo:${mongoPassword}@$(PROJECT_NAME)_${input.appServiceName}-mongo:27017/?tls=false"}`,
        `ROOT_EMAIL=${input.rootEmail}`,
        `ROOT_PASSWORD=${input.rootPassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3001,
        },
      ],
    },
  });

  return { services };
}
