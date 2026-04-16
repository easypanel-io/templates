import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Auto-generate a password if the user left the field blank
  const webuiPassword = input.webuiPassword || randomPassword();

  // ── Service 1: Hermes Agent ──────────────────────────────────────────────────
  //
  // The Hermes Agent image stores its data volume at /opt/data (confirmed by
  // the Dockerfile: ENV HERMES_HOME=/opt/data). The source code lives at
  // /opt/hermes. The entrypoint script bootstraps the data volume on first run
  // and then executes whatever command you pass.
  //
  // IMPORTANT: we do NOT run `hermes gateway run` as the default command.
  // On a fresh install no messaging platform is configured, so the gateway
  // exits immediately with a "gateway not found" style error. Users who want
  // the gateway should run `hermes gateway setup` first and then switch the
  // service command.
  //
  // Instead we run `tail -f /dev/null` which keeps the container alive after
  // the entrypoint has bootstrapped the volume, so users can exec in and run
  // `hermes setup`, `hermes chat`, or start the gateway once configured.
  //
  services.push({
    type: "app",
    data: {
      serviceName: input.agentServiceName,
      source: {
        type: "image",
        image: input.agentServiceImage,
      },
      // Keep the container alive after entrypoint bootstrap so users can
      // `docker exec` to run setup, configure providers, or start the gateway.
      deploy: {
        command: "tail -f /dev/null",
      },
      env: [
        `HERMES_HOME=/opt/data`,
        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey
          ? [`OPENAI_API_KEY=${input.openaiApiKey}`]
          : []),
      ].join("\n"),
      mounts: [
        // Shared Hermes state — bootstrapped by the agent entrypoint on first
        // boot with default config.yaml, SOUL.md, and directory structure.
        // The WebUI reads from this same volume.
        {
          type: "volume",
          name: "hermes-home",
          mountPath: "/opt/data",
        },
        // Agent source code — the Dockerfile COPYs the agent to /opt/hermes.
        // This volume exposes that source to the WebUI container, which runs
        // `uv pip install` from it on first boot to get all agent deps.
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
  // installs the agent's Python deps from the shared hermes-agent-src volume.
  //
  // The WebUI imports Hermes Python modules directly (run_agent, config,
  // models) — no HTTP port needed on the agent container.
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
        // Shared state volume — same data the agent wrote to /opt/data,
        // mounted here at the WebUI's expected Hermes home path.
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
