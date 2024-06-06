import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secret = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_db:5432/${input.projectName}`,
        `JWT_SECRET=${secret}`,
        'ALLOW_REGISTER="false"',
        'ALLOW_OPENAPI="true"',
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 12345,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: "db",
      image: "postgres:16",
      password: databasePassword,
    },
  });

  return { services };
}
