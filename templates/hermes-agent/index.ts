import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      // Pass "sleep infinity" to the entrypoint so the container stays alive
      // after bootstrapping /opt/data, without starting an interactive process.
      //
      // Do NOT override with "tail -f /dev/null" using a shell — that spawns
      // a subshell and can suppress the entrypoint's env exports.
      //
      // Do NOT set HERMES_HOME here. The Dockerfile already sets:
      //   ENV HERMES_HOME=/opt/data
      // Docker preserves image-defined ENV in all exec sessions, so
      // Easypanel's built-in terminal will find HERMES_HOME and the
      // hermes binary (/usr/local/bin/hermes) correctly without any
      // extra configuration.
      //
      // To use the TUI: open Easypanel → Service → Terminal, then run:
      //   hermes setup    (first time, to configure API keys)
      //   hermes          (to start the interactive chat)
      //
      deploy: {
        command: "sleep infinity",
      },
      env: [
        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey
          ? [`OPENAI_API_KEY=${input.openaiApiKey}`]
          : []),
      ].join("\n"),
      mounts: [
        // All Hermes state: config.yaml, .env, sessions, memory, skills, cron.
        // Mounted at /opt/data to match the image's ENV HERMES_HOME=/opt/data.
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/data",
        },
      ],
    },
  });

  return { services };
}
