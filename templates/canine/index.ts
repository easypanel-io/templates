import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const secretKeyBase = randomString(64);
  const webServiceName = `${input.appServiceName}-web`;
  const workerServiceName = `${input.appServiceName}-worker`;
  const dbServiceName = `${input.appServiceName}-db`;

  // Rails' ActiveRecord::DatabaseConfigurations auto-detects any
  // DATABASE_URL env var and parses it via Ruby's strict, legacy
  // URI::RFC2396_Parser regardless of what database.yml says. That
  // parser rejects underscores in hostnames, but Easypanel's internal
  // service hostnames always take the form $(PROJECT_NAME)_<serviceName>,
  // which contains one. So DATABASE_URL is never set here — instead a
  // discrete host/port is injected via a mounted database.yml override,
  // matching the discrete username/password keys Canine's own
  // config/database.yml already uses for production.
  const databaseYaml = `default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("DB_POOL_SIZE", 100).to_i %>

development:
  <<: *default
  database: canine_development

test:
  <<: *default
  database: canine_test

production:
  <<: *default
  database: canine_production
  username: canine
  password: <%= ENV["CANINE_DATABASE_PASSWORD"] %>
  host: <%= ENV["DATABASE_HOST"] %>
  port: <%= ENV.fetch("DATABASE_PORT", 5432) %>
`;

  const sharedEnv = [
    `DATABASE_HOST=$(PROJECT_NAME)_${dbServiceName}`,
    `DATABASE_PORT=5432`,
    `CANINE_DATABASE_PASSWORD=${databasePassword}`,
    `BOOT_MODE=local`,
    `SECRET_KEY_BASE=${secretKeyBase}`,
    `APP_HOST=https://$(PRIMARY_DOMAIN)`,
    `LOCAL_MODE_PASSWORDLESS=false`,
    `REMAP_LOCALHOST=host.docker.internal`,
    `ALLOWED_HOSTNAME=*`,
  ];

  const databaseYamlMount = {
    type: "file" as const,
    content: databaseYaml,
    mountPath: "/rails/config/database.yml",
  };

  services.push({
    type: "app",
    data: {
      serviceName: webServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [...sharedEnv, `PORT=3000`, `ACCOUNT_SIGN_IN_ONLY=true`].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        databaseYamlMount,
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: workerServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [...sharedEnv, `LOCAL_MODE=true`].join("\n"),
      deploy: {
        command: "bundle exec good_job start",
      },
      mounts: [
        databaseYamlMount,
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: dbServiceName,
      databaseName: "canine_production",
      user: "canine",
      password: databasePassword,
    },
  });

  return { services };
}
