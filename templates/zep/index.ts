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
  const zepApiKey = randomString(32);

  const zepYamlFileContent = `log:
  # debug, info, warn, error, panic, dpanic, or fatal. Default = info
  level: info
  # How should logs be formatted? Setting to "console" will print human readable logs
  # whie "json" will print structured JSON logs. Default is "json".
  format: json
http:
  # Host to bind to. Default is 0.0.0.0
  host: 0.0.0.0
  # Port to bind to. Default is 8000
  port: 8000
  max_request_size: 5242880
postgres:
  user: postgres
  password: {{ Env "ZEP_POSTGRES_PASSWORD" }}
  host: {{ Env "ZEP_POSTGRES_HOST" }}
  port: 5432
  database: {{ Env "ZEP_POSTGRES_DATABASE" }}
  schema_name: public
  read_timeout: 30
  write_timeout: 30
  max_open_connections: 10
# Carbon is a package used for dealing with time - github.com/golang-module/carbon
# It is primarily used for generating humand readable relative time strings like "2 hours ago".
# See the list of supported languages here https://github.com/golang-module/carbon?tab=readme-ov-file#i18n
carbon:
  locale: en
graphiti:
   # Base url to the graphiti service
   #service_url: http://graphiti:8003
  service_url: {{ Env "ZEP_GRAPHITI_HOST" }}
# In order to authenicate API requests to the Zep service, a secret must be provided.
# This secret should be kept secret between the Zep service and the client. It can be any string value.
# When making requests to the Zep service, include the secret in the Authorization header.
api_secret: {{ Env "ZEP_API_SECRET" }}
# In order to better understand how Zep is used, we can collect telemetry data.
# This is optional and can be disabled by setting disabled to true.
# We do not collect any PII or any of your data. We only collect anonymized data
# about how Zep is used.
telemetry:
  disabled: false
  # Please provide an identifying name for your organization so can get a better understanding
  # about who is using Zep. This is optional.
  organization_name:
  `;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `ZEP_CONFIG_FILE=zep.yaml`,
        `ZEP_POSTGRES_PASSWORD=${databasePassword}`,
        `ZEP_POSTGRES_HOST=$(PROJECT_NAME)-${input.appServiceName}-db`,
        `ZEP_POSTGRES_DATABASE=$(PROJECT_NAME)`,
        `ZEP_GRAPHITI_HOST=http://$(PROJECT_NAME)_${input.appServiceName}-graphiti:8003`,
        `ZEP_API_SECRET=${zepApiKey}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "file",
          content: zepYamlFileContent,
          mountPath: "/app/zep.yaml",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-graphiti`,
      env: [
        `OPENAI_API_KEY=${input.openai_api_key}`,
        `OPENAI_BASE_URL=${input.openai_base_url}`,
        `MODEL_NAME=${input.openai_model_name}`,
        `NEO4J_URI=bolt://$(PROJECT_NAME)_${input.appServiceName}-neo4j:7687`,
        `NEO4J_USER=neo4j`,
        `NEO4J_PASSWORD=zepzepzep`,
        `PORT=8003`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.graphitiServiceImage,
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-neo4j`,
      env: [`NEO4J_AUTH=neo4j/zepzepzep`].join("\n"),
      source: {
        type: "image",
        image: input.neo4jServiceImage,
      },
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
      image: input.postgresServiceImage,
    },
  });

  return { services };
}
