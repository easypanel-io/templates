import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const apiServerKey = input.apiServerKey || randomPassword();

  // Full venv path required — the entrypoint does `exec "$@"` directly.
  const agentCommand = input.gatewayMode
    ? "/opt/hermes/.venv/bin/hermes gateway run"
    : "sleep infinity";

  // ── Service 1: Hermes Agent ──────────────────────────────────────────────
  //
  // The API server is always enabled internally so the Workspace can reach
  // it. API_SERVER_HOST=0.0.0.0 is required for Traefik and for the
  // Workspace to reach it via the Docker internal network.
  //
  // The agent service only gets a public Easypanel domain when apiServerEnabled
  // is true. Without a domain binding the API is still reachable by the
  // Workspace at http://$(PROJECT_NAME)_agentServiceName:8642 (Docker internal
  // DNS), but is NOT accessible from the internet.
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
        // API server always on — the Workspace needs it over internal network
        `API_SERVER_ENABLED=true`,
        `API_SERVER_HOST=0.0.0.0`,
        `API_SERVER_PORT=8642`,
        `API_SERVER_KEY=${apiServerKey}`,
        // Allow the Workspace's internal requests (no CORS issue on internal
        // network, but the header may still be checked by the server)
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

  // ── Service 2: Hermes Workspace ──────────────────────────────────────────
  //
  // Built from the outsourc-e/hermes-workspace GitHub repo using its own
  // Dockerfile (docker/workspace/Dockerfile). The app runs on port 3000.
  //
  // HERMES_API_URL uses the Docker internal service name pattern:
  //   http://$(PROJECT_NAME)_agentServiceName:8642
  // This resolves inside Docker Swarm's overlay network — the Workspace
  // Node.js server-side proxy hits the agent directly without going through
  // Traefik or the public internet. No API key is sent to the browser.
  //
  // The API key is used server-side only (in server-entry.js / SSR layer)
  // to authenticate the proxied requests to the agent.
  services.push({
    type: "app",
    data: {
      serviceName: input.workspaceServiceName,
      source: {
        type: "github",
        owner: "outsourc-e",
        repo: "hermes-workspace",
        ref: "main",
        // Uses the repo's own Dockerfile for the workspace container
        dockerfilePath: "docker/workspace/Dockerfile",
      },
      env: [
        // Internal Docker network URL — resolves via Swarm DNS.
        // Pattern: http://<project>_<serviceName>:<port>
        `HERMES_API_URL=http://$(PROJECT_NAME)_${input.agentServiceName}:8642`,
        // API key for server-side authenticated requests to the agent.
        // Never exposed to the browser — only used by the Node.js proxy layer.
        `HERMES_API_KEY=${apiServerKey}`,
        // Optional UI password protection
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
