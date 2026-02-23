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
  const encryptionKey = randomString(128);

  const common_envs = [
    `PLUGIN_DIR=bin/plugins`,
    `REMOTE_PLUGIN_DIR=python/plugins`,
    `DB_URL=mysql://mysql:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:3306/$(PROJECT_NAME)?charset=utf8mb4&parseTime=True&loc=UTC`,
    `E2E_DB_URL=mysql://mysql:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:3306/$(PROJECT_NAME)?charset=utf8mb4&parseTime=True&loc=UTC`,
    `DB_LOGGING_LEVEL=Error`,
    `SKIP_SUBTASK_PROGRESS=false`,
    `PORT=8080`,
    `MODE=release`,
    `NOTIFICATION_ENDPOINT=`,
    `NOTIFICATION_SECRET=`,
    `API_TIMEOUT=120s`,
    `API_RETRY=3`,
    `API_REQUESTS_PER_HOUR=10000`,
    `PIPELINE_MAX_PARALLEL=1`,
    `RESUME_PIPELINES=true`,
    `LOGGING_LEVEL=`,
    `LOGGING_DIR=./logs`,
    `ENABLE_STACKTRACE=true`,
    `FORCE_MIGRATION=false`,
    `TAP_PROPERTIES_DIR=`,
    `DISABLED_REMOTE_PLUGINS=`,
    `ENCRYPTION_SECRET=${encryptionKey}`,
    `IN_SECURE_SKIP_VERIFY=false`,
    `ENDPOINT_CIDR_BLACKLIST=`,
    `FORBID_REDIRECTION=false`,
    `USE_GO_GIT_IN_GIT_EXTRACTOR=false`,
    `SKIP_COMMIT_STAT=false`,
    `SKIP_COMMIT_FILES=true`,
    `WRAP_RESPONSE_ERROR=`,
    `ENABLE_SUBTASKS_BY_DEFAULT=jira:collectIssueChangelogs:true,jira:extractIssueChangelogs:true,jira:convertIssueChangelogs:true,tapd:collectBugChangelogs:true,tapd:extractBugChangelogs:true,tapd:convertBugChangelogs:true,zentao:collectBugRepoCommits:true,zentao:extractBugRepoCommits:true,zentao:convertBugRepoCommits:true,zentao:collectStoryRepoCommits:true,zentao:extractStoryRepoCommits:true,zentao:convertStoryRepoCommits:true,zentao:collectTaskRepoCommits:true,zentao:extractTaskRepoCommits:true,zentao:convertTaskRepoCommits:true`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-ui`,
      env: [
        `DEVLAKE_ENDPOINT=$(PROJECT_NAME)_${input.appServiceName}-backend:8080`,
        `GRAFANA_ENDPOINT=$(PROJECT_NAME)_${input.appServiceName}-grafana:3000`,
        `TZ=UTC`,
        common_envs,
      ].join("\n"),
      source: {
        type: "image",
        image: input.uiServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-backend`,
      env: [`LOGGING_DIR=/app/logs`, `TZ=UTC`, common_envs].join("\n"),
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-grafana`,
      env: [
        `GF_SERVER_ROOT_URL=http://$(PROJECT_NAME)_${input.appServiceName}-ui:4000/grafana`,
        `GF_USERS_DEFAULT_THEME=dark`,
        `MYSQL_URL=$(PROJECT_NAME)_${input.appServiceName}-db:3306`,
        `MYSQL_DATABASE=$(PROJECT_NAME)`,
        `MYSQL_USER=mysql`,
        `MYSQL_PASSWORD=${databasePassword}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.grafanaServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "grafana-storage",
          mountPath: "/var/lib/grafana",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
