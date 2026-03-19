import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const gatewayToken = input.gatewayToken || randomPassword();

  const gatewayEnv = [
    "NODE_ENV=production",
    "HOME=/home/node",
    "TERM=xterm-256color",
    `OPENCLAW_GATEWAY_TOKEN=${gatewayToken}`,
  ];

  if (input.claudeAiSessionKey) {
    gatewayEnv.push(`CLAUDE_AI_SESSION_KEY=${input.claudeAiSessionKey}`);
  }
  if (input.claudeWebSessionKey) {
    gatewayEnv.push(`CLAUDE_WEB_SESSION_KEY=${input.claudeWebSessionKey}`);
  }
  if (input.claudeWebCookie) {
    gatewayEnv.push(`CLAUDE_WEB_COOKIE=${input.claudeWebCookie}`);
  }

  const mounts = [
    {
      type: "volume",
      name: "config",
      mountPath: "/home/node/.openclaw",
    },
    {
      type: "volume",
      name: "workspace",
      mountPath: "/home/node/.openclaw/workspace",
    },
  ];

  if (input.enableSandbox) {
    gatewayEnv.push("OPENCLAW_SANDBOX=1");
    // Mount the docker socket so OpenClaw can orchestrate containerized agents
    mounts.push({
      type: "bind",
      hostPath: "/var/run/docker.sock",
      mountPath: "/var/run/docker.sock",
    } as any);
  }

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-gateway`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: gatewayEnv.join("\n"),
      deploy: {
        command: `node dist/index.js gateway --bind ${input.gatewayBind} --port ${input.gatewayPort} --allow-unconfigured`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: input.gatewayPort,
        },
      ],
      ports: [
        {
          published: input.bridgePort,
          target: 18790,
        }
      ],
      mounts,
    },
  });
  return { services };
}
