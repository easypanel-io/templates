import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-server`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8111,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data/teamcity_server/datadir",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/opt/teamcity/logs",
        },
      ],
    },
  });

  if (input.enableAgent) {
    services.push({
      type: "app",
      data: {
        serviceName: `${input.appServiceName}-agent`,
        env: `SERVER_URL=http://$(PROJECT_NAME)_${input.appServiceName}-server`,
        source: {
          type: "image",
          image: input.agentServiceImage,
        },
        mounts: [
          {
            type: "volume",
            name: "agent-conf",
            mountPath: "/data/teamcity_agent/conf",
          },
          {
            type: "volume",
            name: "agent-work",
            mountPath: "/opt/buildagent/work",
          },
          {
            type: "volume",
            name: "agent-temp",
            mountPath: "/opt/buildagent/temp",
          },
          {
            type: "volume",
            name: "agent-tools",
            mountPath: "/opt/buildagent/tools",
          },
          {
            type: "volume",
            name: "agent-plugins",
            mountPath: "/opt/buildagent/plugins",
          },
          {
            type: "volume",
            name: "agent-system",
            mountPath: "/opt/buildagent/system",
          },
        ],
      },
    });
  }

  return { services };
} 