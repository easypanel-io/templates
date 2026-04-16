import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Auto-generate a password if the user left the field blank
  const webuiPassword = input.webuiPassword || randomPassword();

  // ── Service 1: Hermes Agent ──────────────────────────────────────────────────
  //
  // Mirrors the official docker-compose.two-container.yml from the WebUI repo.
  //
  // Critical points:
  //   1. HERMES_HOME is overridden to /root/.hermes — this matches what the
  //      WebUI expects to share, and is what the official compose uses.
  //   2. The hermes-agent-src volume is mounted at /opt/hermes (the path the
  //      agent's Dockerfile COPYs the source to). On first creation, Docker
  //      populates an empty named volume from the image's contents at that
  //      mount point, so the agent source is copied into the volume.
  //   3. We keep the default image entrypoint and override the command with
  //      `tail -f /dev/null`. The entrypoint still runs and bootstraps
  //      /root/.hermes with default config, then `tail` keeps the container
  //      alive so users can `docker exec` in to run setup.
  //
  // Do NOT use `gateway run` as the default — it requires a configured
  // messaging platform and exits with "gateway not found" on a fresh install.
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
        command: "tail -f /dev/null",
      },
      env: [
        // Match the official two-container compose exactly
        `HERMES_HOME=/root/.hermes`,
        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey
          ? [`OPENAI_API_KEY=${input.openaiApiKey}`]
          : []),
      ].join("\n"),
      mounts: [
        // Shared Hermes state — bootstrapped by the agent entrypoint with
        // default config.yaml, SOUL.md, and directory structure.
        {
          type: "volume",
          name: "hermes-home",
          mountPath: "/root/.hermes",
        },
        // Agent source code — the Dockerfile COPYs the agent to /opt/hermes.
        // Docker auto-populates this empty volume from the image contents on
        // first creation, exposing the source to the WebUI container.
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
  // On boot, docker_init.bash:
  //   1. Looks for the agent at HERMES_WEBUI_AGENT_DIR
  //      (= /home/hermeswebui/.hermes/hermes-agent — the source-volume mount)
  //   2. Runs `uv pip install` from that path to get all agent Python deps
  //   3. Starts server.py on HERMES_WEBUI_HOST:HERMES_WEBUI_PORT
  //
  // The WebUI then imports Hermes Python modules directly (run_agent, config,
  // models). No HTTP needed between containers — interop is purely via the
  // two shared named volumes.
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
        // Path the WebUI init script pip-installs the agent from
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
        // Same hermes-home volume as the agent — gives WebUI access to config,
        // sessions, memory, skills written by the agent container.
        {
          type: "volume",
          name: "hermes-home",
          mountPath: "/home/hermeswebui/.hermes",
        },
        // Same hermes-agent-src volume as the agent — gives WebUI access to
        // the agent Python source for `uv pip install`.
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
