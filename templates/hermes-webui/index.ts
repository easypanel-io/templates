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
      // Keep the container alive so users can `docker exec` (or use the
      // Easypanel terminal) to run `hermes setup` and `hermes` interactively.
      // The image entrypoint still runs and bootstraps /opt/data on first boot.
      // To enable the messaging gateway, change this command to:
      //   hermes gateway run
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
        // All Hermes state: config.yaml, .env, sessions, memory, skills, cron
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
