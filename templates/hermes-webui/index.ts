import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // ─── Volume names ────────────────────────────────────────────────────────────
  //
  // hermes-home:       Shared Hermes state — config, .env, sessions, memory,
  //                    skills, cron, logs. Both containers mount this.
  //                    Agent path:  /root/.hermes  (image default)
  //                    WebUI path:  /home/hermeswebui/.hermes  (image default)
  //
  // hermes-agent-src:  The agent's installed source code. The agent container
  //                    writes its own /opt/hermes here. The WebUI init script
  //                    reads from /home/hermeswebui/.hermes/hermes-agent and
  //                    runs `uv pip install` to get all agent Python deps.
  //
  // workspace:         Default workspace directory browsable in the WebUI's
  //                    right-panel file browser.
  //
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Service 1: Hermes Agent ──────────────────────────────────────────────────
  //
  // Runs in "gateway run" mode: handles Telegram/Discord/Slack messaging,
  // cron jobs, event hooks, and background agent tasks. The WebUI does NOT
  // communicate with this container over a network port — interop happens
  // entirely through the shared hermes-home and hermes-agent-src volumes.
  //
  services.push({
    type: "app",
    data: {
      serviceName: input.agentServiceName,
      source: {
        type: "image",
        image: input.agentServiceImage,
      },
      // "gateway run" keeps the agent alive as a persistent background process
      deploy: {
        command: "gateway run",
      },
      env: [
        `HERMES_HOME=/root/.hermes`,
        // Inject API keys if provided — these override /root/.hermes/.env
        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey
          ? [`OPENAI_API_KEY=${input.openaiApiKey}`]
          : []),
      ].join("\n"),
      mounts: [
        // Shared state: config, sessions, memory, skills, cron, .env
        {
          type: "volume",
          name: "hermes-home",
          mountPath: "/root/.hermes",
        },
        // Agent source code exposed to WebUI for Python dependency install
        {
          type: "volume",
          name: "hermes-agent-src",
          mountPath: "/opt/hermes",
        },
      ],
    },
  });

  // ── Service 2: Hermes WebUI ──────────────────────────────────────────────────
  //
  // Serves the browser interface on port 8787. On first boot, docker_init.bash
  // runs `uv pip install /home/hermeswebui/.hermes/hermes-agent` to install
  // the agent's Python deps from the shared hermes-agent-src volume.
  //
  // The WebUI imports Hermes Python modules directly (run_agent, config, models)
  // rather than calling the agent over HTTP. This means:
  //   - No port binding needed on the agent container
  //   - WebUI uses the exact same agent code version
  //   - Config, sessions, and state are always in sync via hermes-home
  //
  services.push({
    type: "app",
    data: {
      serviceName: input.webuiServiceName,
      source: {
        type: "image",
        image: input.webuiServiceImage,
      },
      env: [
        // Bind to all interfaces so Easypanel's reverse-proxy can reach it
        `HERMES_WEBUI_HOST=0.0.0.0`,
        `HERMES_WEBUI_PORT=8787`,
        // Password protection — enforced by server.py's auth middleware
        `HERMES_WEBUI_PASSWORD=${input.hermesWebUIPassword}`,
        // Point to the shared hermes-home volume
        `HERMES_HOME=/home/hermeswebui/.hermes`,
        `HERMES_WEBUI_STATE_DIR=/home/hermeswebui/.hermes/webui-mvp`,
        // The WebUI init script looks here for the agent source to pip-install
        // This path must match the hermes-agent-src volume's mountPath below
        `HERMES_WEBUI_AGENT_DIR=/home/hermeswebui/.hermes/hermes-agent`,
        // Workspace visible in the right-panel file browser
        `HERMES_WEBUI_DEFAULT_WORKSPACE=/workspace`,
        // User-configurable UI defaults
        `HERMES_WEBUI_DEFAULT_MODEL=${input.defaultModel ?? "openai/gpt-4o-mini"}`,
        `HERMES_WEBUI_BOT_NAME=${input.botName ?? "Hermes"}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8787,
        },
      ],
      mounts: [
        // Shared hermes state — same volume as the agent, different mount path
        {
          type: "volume",
          name: "hermes-home",
          mountPath: "/home/hermeswebui/.hermes",
        },
        // Agent source code — WebUI init installs deps from here on first boot
        // The volume is populated by the agent container writing to /opt/hermes
        {
          type: "volume",
          name: "hermes-agent-src",
          mountPath: "/home/hermeswebui/.hermes/hermes-agent",
        },
        // Workspace files browsable in the WebUI right panel
        {
          type: "volume",
          name: "workspace",
          mountPath: "/workspace",
        },
      ],
    },
  });

  return { services };
}
