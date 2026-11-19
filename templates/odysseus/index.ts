import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const searxngSecret = randomString(32);
  const chromaHostname = `$(PROJECT_NAME)_${input.appServiceName}-chroma`;
  const searxngHostname = `$(PROJECT_NAME)_${input.appServiceName}-searxng`;

  const searxngSettings = `use_default_settings: true

server:
  secret_key: "${searxngSecret}"

search:
  formats:
    - html
    - json
`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "github",
        owner: "pewdiepie-archdaemon",
        repo: "odysseus",
        ref: "main",
        path: "/",
        autoDeploy: false,
      },
      build: {
        type: "dockerfile",
      },
      env: [
        `APP_BIND=0.0.0.0`,
        `APP_PORT=7000`,
        `AUTH_ENABLED=true`,
        `SECURE_COOKIES=false`,
        `DATABASE_URL=sqlite:///./data/app.db`,
        `CHROMADB_HOST=${chromaHostname}`,
        `CHROMADB_PORT=8000`,
        `SEARXNG_INSTANCE=http://${searxngHostname}:8080`,
        `OLLAMA_BASE_URL=${input.ollamaBaseUrl || ""}`,
        `OPENAI_API_KEY=${input.openaiApiKey || ""}`,
        `CLEANUP_INTERVAL_HOURS=24`,
        `ODYSSEUS_INPROCESS_POLLERS=1`,
        `ODYSSEUS_INPROCESS_TASKS=1`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/data",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/app/logs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-chroma`,
      source: {
        type: "image",
        image: "chromadb/chroma:1.5.9",
      },
      env: [`ANONYMIZED_TELEMETRY=false`].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "chromadb-data",
          mountPath: "/chroma/chroma",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-searxng`,
      source: {
        type: "image",
        image: "searxng/searxng:2026.5.31-7159b8aed",
      },
      mounts: [
        {
          type: "file",
          content: searxngSettings,
          mountPath: "/etc/searxng/settings.yml",
        },
      ],
    },
  });

  return { services };
}
