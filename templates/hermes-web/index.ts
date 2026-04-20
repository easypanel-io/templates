import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const apiServerKey = input.apiServerKey || randomPassword();

  const agentCommand = input.gatewayMode
    ? "/opt/hermes/.venv/bin/hermes gateway run"
    : "sleep infinity";

  // ── Service 1: Hermes Agent ──────────────────────────────────────────────
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
      // Only expose publicly when explicitly requested.
      // The Workspace reaches the agent via internal Docker DNS regardless.
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

  // ── Service 2: Hermes Workspace ──────────────────────────────────────────
  // Built from outsourc-e/hermes-workspace using its own Dockerfile.
  // source.type must be "git" — the only valid literal for a remote repo
  // in the Easypanel template schema. The Dockerfile path is passed via
  // the build config, not inside source.
  //
  // HERMES_API_URL uses Docker Swarm internal DNS:
  //   http://$(PROJECT_NAME)_agentServiceName:8642
  // The Workspace Node.js server proxies requests to the agent server-side,
  // so the API key is never exposed to the browser.
  services.push({
    type: "app",
    data: {
      serviceName: input.workspaceServiceName,
      source: {
        type: "git",
        repo: "https://github.com/outsourc-e/hermes-workspace",
        ref: "main",
      },
      build: {
        type: "dockerfile",
        // The repo ships a dedicated workspace Dockerfile
        dockerfile: "docker/workspace/Dockerfile",
      },
      env: [
        // Internal Docker network — resolves via Swarm DNS, never hits internet
        `HERMES_API_URL=http://$(PROJECT_NAME)_${input.agentServiceName}:8642`,
        // Server-side only — proxied by Node.js, not sent to browser
        `HERMES_API_KEY=${apiServerKey}`,
        ...(input.workspacePassword
          ? [`HERMES_PASSWORD=${input.workspacePassword}`]
          : []),
        `PORT=3000`,
      ].join("\n"),
      domains: [
        { host: "$(EASYPANEL_DOMAIN)", port: 3000 },
      ],
    },
  });

  return { services };
}
