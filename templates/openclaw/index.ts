import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const gatewayToken = input.gatewayToken || randomString(64);

  const gatewayEnv = [
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
        command: `node dist/index.js gateway --bind ${input.gatewayBind} --port 18789 --allow-unconfigured`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 18789,
        },
      ],
      mounts: [
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
      ],
    },
  });
  return { services };
}
