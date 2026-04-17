import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Auto-generate API server key if not provided. This key is shared between
  // the agent (API_SERVER_KEY) and the Web UI (VITE_API_KEY) so the browser
  // dashboard can authenticate against the agent's port-8642 endpoint.
  const apiServerKey = input.apiServerKey || randomPassword();

  // Agent command — full venv path required because the entrypoint does
  // `exec "$@"` directly. "gateway" alone is not a binary.
  const agentCommand = input.gatewayMode
    ? "/opt/hermes/.venv/bin/hermes gateway run"
    : "sleep infinity";

  // ── Service 1: Hermes Agent ──────────────────────────────────────────────
  // Runs the agent with the API server always enabled so the Web UI can
  // connect. Port 8642 is exposed via Easypanel's domain/proxy.
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
        // Full venv PATH so `docker exec` sessions find the hermes binary
        `PATH=/opt/hermes/.venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
        `HERMES_HOME=/opt/data`,
        // API server — always on when Web UI is deployed
        `API_SERVER_ENABLED=true`,
        `API_SERVER_HOST=0.0.0.0`,
        `API_SERVER_PORT=8642`,
        `API_SERVER_KEY=${apiServerKey}`,
        // Allow the Web UI origin (Easypanel proxies requests so * is safe
        // behind HTTPS; tighten to the specific WebUI domain if preferred)
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
      domains: [
        // Expose the API server so the Web UI (and Claude Code / Cursor) can
        // reach it. Easypanel provides HTTPS termination via Traefik.
        { host: "$(EASYPANEL_DOMAIN)", port: 8642 },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/data",
        },
      ],
    },
  });

  // ── Service 2: Hermes Web UI ─────────────────────────────────────────────
  // Vue 3 SPA built from the EKKOLearnAI/hermes-web-ui GitHub repo.
  // The `hermes-web-ui start` command (from bin/) serves the built dist/
  // on port 8648.
  //
  // VITE_API_BASE_URL and VITE_API_KEY are build-time env vars consumed by
  // Vite. We pass the agent's Easypanel domain as the API base URL so the
  // browser talks to the agent over HTTPS.
  //
  // AGENT_API_URL and AGENT_API_KEY are runtime env vars read by the
  // bin/hermes-web-ui start server (Node.js static server) to proxy or
  // inject config at startup.
  services.push({
    type: "app",
    data: {
      serviceName: input.webuiServiceName,
      source: {
        type: "github",
        owner: "EKKOLearnAI",
        repo: "hermes-web-ui",
        ref: "main",
        buildCommand: "npm install && npm run build",
        startCommand: "node bin/hermes-web-ui start",
      },
      env: [
        // Vite build-time: the agent's public HTTPS domain on port 8642.
        // $(EASYPANEL_DOMAIN) resolves to the agent service's auto-assigned domain.
        `VITE_API_BASE_URL=https://$(PROJECT_NAME)-${input.agentServiceName}.$(EASYPANEL_DOMAIN)`,
        `VITE_API_KEY=${apiServerKey}`,
        // Runtime config for the Node.js static server
        `AGENT_API_URL=https://$(PROJECT_NAME)-${input.agentServiceName}.$(EASYPANEL_DOMAIN)`,
        `AGENT_API_KEY=${apiServerKey}`,
        `PORT=8648`,
      ].join("\n"),
      domains: [
        { host: "$(EASYPANEL_DOMAIN)", port: 8648 },
      ],
    },
  });

  return { services };
}
