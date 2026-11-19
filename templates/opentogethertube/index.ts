import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const databaseServiceName = `${input.appServiceName}-db`;
  const redisServiceName = `${input.appServiceName}-redis`;
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const sessionSecret = randomString(64);
  const apiKey = randomString(48);

  const productionToml = `docker = true
hostname = "$(PRIMARY_DOMAIN)"

session_secret = "${sessionSecret}"
api_key = "${apiKey}"

[db]
mode = "postgres"

[info_extractor.youtube]
api_key = "${input.youtubeApiKey || ""}"
`;

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
          port: 8080,
        },
      ],
      env: [
        `PORT=8080`,
        `DOCKER=1`,
        `REDIS_HOST=$(PROJECT_NAME)_${redisServiceName}`,
        `REDIS_PORT=6379`,
        `REDIS_PASSWORD=${redisPassword}`,
        `POSTGRES_HOST=$(PROJECT_NAME)_${databaseServiceName}`,
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_DB=$(PROJECT_NAME)`,
      ].join("\n"),
      mounts: [
        {
          type: "file",
          content: productionToml,
          mountPath: "/app/env/production.toml",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
