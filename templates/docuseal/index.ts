import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `FORCE_SSL=true`,
        `DATABASE_URL=postgres://postgres:${dbPassword}@$(PROJECT_NAME)_${input.databaseServiceName}:5432/$(PROJECT_NAME)`
      ].join("\n"),
      source: {
        type: "image",
        image: 'docuseal/docuseal:1.4.3',
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
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: dbPassword,
    },
  });

  return { services };
}
