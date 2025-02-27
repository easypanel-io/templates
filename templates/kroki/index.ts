import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `KROKI_MERMAID_HOST=$(PROJECT_NAME)_${input.appServiceName}-mermaid`,
        `KROKI_BPMN_HOST=$(PROJECT_NAME)_${input.appServiceName}-bpmn`,
        `KROKI_EXCALIDRAW_HOST=$(PROJECT_NAME)_${input.appServiceName}-excalidraw`,
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
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-mermaid`,
      source: {
        type: "image",
        image: input.mermaidServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8002,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-bpmn`,
      source: {
        type: "image",
        image: input.bpmnServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8003,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-excalidraw`,
      source: {
        type: "image",
        image: input.excalidrawServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8004,
        },
      ],
    },
  });

  return { services };
}
