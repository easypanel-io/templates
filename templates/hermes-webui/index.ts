import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // The official ghcr.io/nesquena/hermes-webui image bundles both
  // Hermes Agent and the WebUI in a single container. The init script
  // installs the agent's Python dependencies on first boot and then
  // starts server.py, which binds on HERMES_WEBUI_PORT (default 8787).
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        // Bind to all interfaces so Easypanel's reverse-proxy can reach it
        `HERMES_WEBUI_HOST=0.0.0.0`,
        `HERMES_WEBUI_PORT=8787`,
        // Password protection — enforced by server.py's auth middleware
        `HERMES_WEBUI_PASSWORD=${input.hermesWebUIPassword}`,
        // State directories inside the persistent volume
        `HERMES_HOME=/home/hermeswebui/.hermes`,
        `HERMES_WEBUI_STATE_DIR=/home/hermeswebui/.hermes/webui-mvp`,
        // Agent directory — the image ships the agent here by default
        `HERMES_WEBUI_AGENT_DIR=/home/hermeswebui/.hermes/hermes-agent`,
        // Workspace mount target
        `HERMES_WEBUI_DEFAULT_WORKSPACE=/workspace`,
        // User-configurable
        `HERMES_WEBUI_DEFAULT_MODEL=${input.defaultModel ?? "openai/gpt-4o-mini"}`,
        `HERMES_WEBUI_BOT_NAME=${input.botName ?? "Hermes"}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8787,
        },
      ],
      mounts: [
        // Persistent Hermes state: config, sessions, memory, skills, agent install
        {
          type: "volume",
          name: "hermes-home",
          mountPath: "/home/hermeswebui/.hermes",
        },
        // Workspace files visible in the right-panel file browser
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
