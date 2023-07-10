import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const appEnv = [
    `ME_CONFIG_MONGODB_URL=mongodb://mongo:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:27017`,
  ];

  if (input.appAuthPassword) {
    appEnv.push(
      `ME_CONFIG_BASICAUTH=true`,
      `ME_CONFIG_BASICAUTH_USERNAME=${input.appAuthUsername || "admin"}`,
      `ME_CONFIG_BASICAUTH_PASSWORD=${input.appAuthPassword}`
    );
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8081 }],
      deploy: { command: "sleep 60; /docker-entrypoint.sh" },
      env: appEnv.join("\n"),
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
