import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Auto-generate a password if the user left the field blank
  const webuiPassword = input.webuiPassword || randomPassword();

  // ── Service 1: Hermes Agent ──────────────────────────────────────────────────
  //
  // Runs "gateway run" — a persistent background process handling Telegram,
  // Discord, Slack, cron jobs, and event hooks.
  //
  // Interop with the WebUI is filesystem-only via two shared named volumes:
  //   hermes-home      — config, .env, sessions, memory, skills, cron, logs
  //   hermes-agent-src — agent Python source; WebUI runs `uv pip install` from
  //                      here on first boot to get all agent dependencies
  //
  services.push({
    type: "app",
    data: {
      serviceName: input.agentServiceName,
      source: {
        type: "image",
        image: input.agentServiceImage,
      },
      deploy: {
        command: "gateway run",
      },
      env: [
        `HERMES_HOME=/root/.hermes`,
        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey
          ? [`OPENAI_API_KEY=${input.openaiApiKey}`]
          : []),
      ].join("\n"),
      mounts: [
        // Shared Hermes state: config, .env, sessions, memory, skills, cron
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
  // agent Python deps from the shared hermes-agent-src volume.
  //
  // The WebUI imports Hermes Python modules directly (run_agent, config, models)
  // — no HTTP port needed on the agent container.
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
        `HERMES_WEBUI_HOST=0.0.0.0`,
        `HERMES_WEBUI_PORT=8787`,
        `HERMES_WEBUI_PASSWORD=${webuiPassword}`,
        `HERMES_HOME=/home/hermeswebui/.hermes`,
        `HERMES_WEBUI_STATE_DIR=/home/hermeswebui/.hermes/webui-mvp`,
        // The WebUI init script pip-installs the agent from this path
        `HERMES_WEBUI_AGENT_DIR=/home/hermeswebui/.hermes/hermes-agent`,
        `HERMES_WEBUI_DEFAULT_WORKSPACE=/workspace`,
        `HERMES_WEBUI_DEFAULT_MODEL=${input.defaultModel ?? "openai/gpt-4o-mini"}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8787,
        },
      ],
      mounts: [
        // Shared state volume — same data as agent, different container path
        {
          type: "volume",
          name: "hermes-home",
          mountPath: "/home/hermeswebui/.hermes",
        },
        // Agent source — populated by the agent container at /opt/hermes
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
