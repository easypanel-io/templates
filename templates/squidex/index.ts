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
        `URLS__BASEURL=https://$(PRIMARY_DOMAIN)`,
        `EVENTSTORE__TYPE=MongoDB`,
        `EVENTSTORE__MONGODB__CONFIGURATION=mongodb://mongo:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:27017/?tls=false`,
        `STORE__MONGODB__CONFIGURATION=mongodb://mongo:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:27017/?tls=false`,
        `IDENTITY__ADMINEMAIL=${input.adminEmailAddress || ""}`,
        `IDENTITY__ADMINPASSWORD=${input.adminPassword || ""}`,
        `IDENTITY__GOOGLECLIENT=${input.googleClient || ""}`,
        `IDENTITY__GOOGLESECRET=${input.googleClientSecret || ""}`,
        `IDENTITY__GITHUBCLIENT=${input.githubClient || ""}`,
        `IDENTITY__GITHUBSECRET=${input.githubClientSecret || ""}`,
        `IDENTITY__MICROSOFTCLIENT=${input.microsoftClient || ""}`,
        `IDENTITY__MICROSOFTSECRET=${input.microsoftClientSecret || ""}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "assets",
          mountPath: "/app/Assets",
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
