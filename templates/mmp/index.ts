import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const agentServiceName = `${input.appServiceName}-agent`;

  services.push({
    type: "app",
    data: {
      serviceName: agentServiceName,
      source: {
        type: "image",
        image: input.agentServiceImage,
      },
      env: [
        `LIBRARY_PATH=/library`,
        `DATA_PATH=/data`,
        ...(input.thingiverseToken
          ? [`THINGIVERSE_TOKEN=${input.thingiverseToken}`]
          : []),
        ...(input.modelRenderColor
          ? [`MODEL_RENDER_COLOR=${input.modelRenderColor}`]
          : []),
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      ports: [
        {
          protocol: "tcp",
          published: 8000,
          target: 8000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "library",
          mountPath: "/library",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.uiServiceImage,
      },
      env: [`AGENT_ADDRESS=$(PROJECT_NAME)_${agentServiceName}:8000`].join(
        "\n"
      ),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8081,
        },
      ],
    },
  });

  return { services };
}
