import {
  Output,
  randomPassword,
  Services
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `RAILS_ENV=production`,
        `GITHUB_CLIENT_ID=${input.githubClient}`,
        `GITHUB_CLIENT_SECRET=${input.githubSecret}`,
        `OCTOBOX_DATABASE_NAME=${input.projectName}`,
        `OCTOBOX_DATABASE_USERNAME=postgres`,
        `OCTOBOX_DATABASE_PASSWORD=${databasePassword}`,
        `OCTOBOX_DATABASE_HOST=${input.projectName}_${input.databaseServiceName}`,
        `REDIS_URL=PAPERLESS_REDIS=redis://default:${redisPassword}@${input.projectName}_${input.redisServiceName}:6379`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 3000,
        secure: true,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
