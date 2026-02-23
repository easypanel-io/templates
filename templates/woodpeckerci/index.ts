import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const githubAgentSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `WOODPECKER_OPEN=true`,
        `WOODPECKER_HOST=https://$(PRIMARY_DOMAIN)`,
        `WOODPECKER_GITHUB=true`,
        `WOODPECKER_GITHUB_CLIENT=${input.githubClient}`,
        `WOODPECKER_GITHUB_SECRET=${input.githubSecret}`,
        `WOODPECKER_AGENT_SECRET=${githubAgentSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "woodpecker-server-data",
          mountPath: "/var/lib/woodpecker/",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-agent`,
      env: [
        `WOODPECKER_SERVER=$(PROJECT_NAME)_${input.appServiceName}:9000`,
        `WOODPECKER_AGENT_SECRET=${githubAgentSecret}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.agentServiceImage,
      },
      mounts: [
        {
          type: "volume",
          name: "woodpecker-agent-config",
          mountPath: "/etc/woodpecker",
        },
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  return { services };
}
