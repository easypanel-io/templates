import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const apiServerKey = input.apiServerKey || randomPassword();

  const agentCommand = input.gatewayMode
    ? "/opt/hermes/.venv/bin/hermes gateway run"
    : "sleep infinity";

  // ── Service 1: Hermes Agent (app service — image source) ──────────────────
  //
  // All app services in the Easypanel template system must use source.type
  // "image". The "git" source type on app services requires a `path` property
  // and is not used by any published template — only compose services support
  // git sources correctly.
  services.push({
    type: "app",
    data: {
      serviceName: input.agentServiceName,
      source: {
        type: "image",
        image: input.agentServiceImage,
      },
      deploy: {
        command: agentCommand,
      },
      env: [
        `PATH=/opt/hermes/.venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
        `HERMES_HOME=/opt/data`,
        // API server must be enabled — the Workspace reaches it via Docker
        // internal DNS (http://$(PROJECT_NAME)_agentServiceName:8642)
        `API_SERVER_ENABLED=true`,
        `API_SERVER_HOST=0.0.0.0`,
        `API_SERVER_PORT=8642`,
        `API_SERVER_KEY=${apiServerKey}`,
        `API_SERVER_CORS_ORIGINS=*`,
        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey
          ? [`OPENAI_API_KEY=${input.openaiApiKey}`]
          : []),
        ...(input.telegramBotToken
          ? [`TELEGRAM_BOT_TOKEN=${input.telegramBotToken}`]
          : []),
        ...(input.discordBotToken
          ? [`DISCORD_BOT_TOKEN=${input.discordBotToken}`]
          : []),
      ].join("\n"),
      // Only expose a public HTTPS domain when explicitly requested.
      // The Workspace connects internally regardless of this setting.
      ...(input.apiServerEnabled
        ? { domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8642 }] }
        : {}),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/data",
        },
      ],
    },
  });

  // ── Service 2: Hermes Workspace (compose service — git source) ───────────
  //
  // The compose service type is the only correct way to deploy from a git
  // repository in the Easypanel template system. It clones the repo, finds
  // the docker-compose.yml, and runs it. The `source.type: "git"` is valid
  // here (unlike on app services where it requires an unusable `path` field).
  //
  // Environment variables are injected via `env` + `createDotEnv: true`,
  // which writes a .env file next to the compose file before startup so
  // docker-compose can read them as substitutions.
  //
  // HERMES_API_URL uses Docker Swarm internal DNS so the Workspace Node.js
  // server proxies requests to the agent without going via the public internet.
  // The API key never reaches the browser — it stays server-side in Node.js.
  services.push({
    type: "compose",
    data: {
      serviceName: input.workspaceServiceName,
      source: {
        type: "git",
        repo: "https://github.com/outsourc-e/hermes-workspace",
        ref: "main",
        rootPath: "/",
        composeFile: "docker-compose.yml",
      },
      // createDotEnv writes env vars into a .env file that docker-compose
      // picks up automatically for variable substitution
      createDotEnv: true,
      env: [
        // Internal Docker Swarm DNS — never hits the public internet
        `HERMES_API_URL=http://$(PROJECT_NAME)_${input.agentServiceName}:8642`,
        // Server-side auth token — proxied by Node.js, not sent to browser
        `HERMES_API_KEY=${apiServerKey}`,
        ...(input.workspacePassword
          ? [`HERMES_PASSWORD=${input.workspacePassword}`]
          : []),
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
          // "hermes-workspace" is the service name inside the docker-compose.yml
          service: "hermes-workspace",
        },
      ],
    },
  });

  return { services };
}
