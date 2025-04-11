import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

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
      env: [
        "GO_ENV=PRODUCTION",
        "DBSkipSSL=true",
        `DBHost=$(PROJECT_NAME)_${input.appServiceName}-db`,
        "DBPort=5432",
        `DBName=$(PROJECT_NAME)`,
        `DBUser=postgres`,
        `DBPassword=${databasePassword}`,
        `WebURL=https://$(PRIMARY_DOMAIN)`,
        "OnPremises=true",
        `SmtpHost=${input.SmtpHost}`,
        `SmtpPort=${input.SmtpPort}`,
        `SmtpUsername=${input.SmtpUser}`,
        `SmtpPassword=${input.SmtpPassword}`,
        `SmtpFrom=${input.SmtpFrom}`,
        `DisableRegistration=false`,
      ].join("\n"),
    },
  });

  return { services };
}
