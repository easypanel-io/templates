import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `RAILS_ENV=development`,
        `GITHUB_CLIENT_ID=${input.githubClient}`,
        `GITHUB_CLIENT_SECRET=${input.githubSecret}`,
        `OCTOBOX_DATABASE_NAME=$(PROJECT_NAME)`,
        `OCTOBOX_DATABASE_USERNAME=postgres`,
        `OCTOBOX_DATABASE_PASSWORD=${databasePassword}`,
        `OCTOBOX_DATABASE_HOST=$(PROJECT_NAME)_${input.databaseServiceName}`,
        `REDIS_URL=redis://default:${redisPassword}@$(PROJECT_NAME)_${input.redisServiceName}:6379`,
        `ALLOW_ALL_HOSTNAMES=true`,
      ].join("\n"),
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
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: { serviceName: input.redisServiceName, password: redisPassword },
  });

  return { services };
}
