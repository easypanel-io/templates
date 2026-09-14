import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const useLocalGenerator = input.imageDescriptionProvider === "local";

  const volumesBasePath = `/etc/easypanel/projects/$(PROJECT_NAME)/${input.appServiceName}/volumes`;

  // Rails' DATABASE_URL parsing goes through ActiveRecord's
  // ConnectionUrlResolver, which forces Ruby's strict, legacy
  // URI::RFC2396_Parser. That parser rejects underscores in hostnames,
  // but Easypanel's internal service hostnames always take the form
  // $(PROJECT_NAME)_<serviceName>, which contains one. A discrete
  // host/port/database.yml (mounted below) avoids URL parsing entirely.
  const databaseYaml = `test:
  adapter: postgresql
  encoding: unicode
  pool: 5
  timeout: 5000
  database: meme_test

development:
  adapter: postgresql
  encoding: unicode
  pool: 5
  timeout: 5000
  database: meme_development

production:
  adapter: postgresql
  encoding: unicode
  pool: 5
  timeout: 5000
  host: <%= ENV["DATABASE_HOST"] %>
  port: <%= ENV["DATABASE_PORT"] %>
  database: <%= ENV["DATABASE_NAME"] %>
  username: <%= ENV["DATABASE_USER"] %>
  password: <%= ENV["DATABASE_PASSWORD"] %>
`;

  const sharedEnv = [
    `DATABASE_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
    `DATABASE_PORT=5432`,
    `DATABASE_NAME=$(PROJECT_NAME)`,
    `DATABASE_USER=postgres`,
    `DATABASE_PASSWORD=${databasePassword}`,
    `IMAGE_DESCRIPTION_PROVIDER=${input.imageDescriptionProvider}`,
    `OPENAI_API_BASE_URL=${input.openaiApiBaseUrl ?? ""}`,
    `OPENAI_API_KEY=${input.openaiApiKey ?? ""}`,
    `OPENAI_VISION_MODEL=${input.openaiVisionModel ?? ""}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.webImage,
      },
      env: sharedEnv.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "file",
          content: databaseYaml,
          mountPath: "/rails/config/database.yml",
        },
        {
          type: "volume",
          name: "memes",
          mountPath: "/rails/public/memes",
        },
        {
          type: "volume",
          name: "direct-uploads",
          mountPath: "/rails/public/memes/direct-uploads",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-jobs`,
      source: {
        type: "image",
        image: input.webImage,
      },
      env: sharedEnv.join("\n"),
      deploy: {
        command: "./bin/jobs",
      },
      mounts: [
        {
          type: "file",
          content: databaseYaml,
          mountPath: "/rails/config/database.yml",
        },
        {
          type: "bind",
          hostPath: `${volumesBasePath}/memes`,
          mountPath: "/rails/public/memes",
        },
        {
          type: "bind",
          hostPath: `${volumesBasePath}/direct-uploads`,
          mountPath: "/rails/public/memes/direct-uploads",
        },
      ],
    },
  });

  if (useLocalGenerator) {
    services.push({
      type: "app",
      data: {
        serviceName: `${input.appServiceName}-generator`,
        source: {
          type: "image",
          image: input.generatorImage,
        },
        env: [
          `APP_PORT=3000`,
          `GEN_URL=http://$(PROJECT_NAME)_${input.appServiceName}:3000`,
        ].join("\n"),
        mounts: [
          {
            type: "bind",
            hostPath: `${volumesBasePath}/memes`,
            mountPath: "/app/public/memes",
          },
          {
            type: "bind",
            hostPath: `${volumesBasePath}/direct-uploads`,
            mountPath: "/app/public/memes/direct-uploads",
          },
          {
            type: "volume",
            name: "generator-db",
            mountPath: "/app/db",
          },
          {
            type: "volume",
            name: "models",
            mountPath: "/root/.cache/huggingface",
          },
        ],
        resources: {
          memoryReservation: 0,
          memoryLimit: 12288,
          cpuReservation: 0,
          cpuLimit: 0,
        },
      },
    });
  }

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image: "pgvector/pgvector:pg17",
    },
  });

  return { services };
}
