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
  const encryptionKey = randomString(32);
  const runnersAuthToken = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `DB_TYPE=postgresdb`,
        `DB_POSTGRESDB_HOST=$(PROJECT_NAME)_${input.appServiceName}-db`,
        `DB_POSTGRESDB_PORT=5432`,
        `DB_POSTGRESDB_DATABASE=$(PROJECT_NAME)`,
        `DB_POSTGRESDB_USER=postgres`,
        `DB_POSTGRESDB_PASSWORD=${databasePassword}`,
        `N8N_ENCRYPTION_KEY=${encryptionKey}`,
        `N8N_RUNNERS_MODE=external`,
        `N8N_RUNNERS_AUTH_TOKEN=${runnersAuthToken}`,
        `N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0`,
        `WEBHOOK_URL=https://$(PRIMARY_DOMAIN)`,
        `N8N_HOST=$(PRIMARY_DOMAIN)`,
        `N8N_PROTOCOL=https`,
        `EXECUTIONS_DATA_PRUNE=true`,
        `N8N_PROXY_HOPS=1`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5678,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/home/node/.n8n",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-runner`,
      env: [
        `N8N_RUNNERS_AUTH_TOKEN=${runnersAuthToken}`,
        `N8N_RUNNERS_TASK_BROKER_URI=http://$(PROJECT_NAME)_${input.appServiceName}:5679`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.n8nRunnerServiceImage,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
