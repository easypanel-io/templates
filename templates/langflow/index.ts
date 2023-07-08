import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "github",
        owner: "logspace-ai",
        repo: "langflow",
        ref: "dev",
        path: "/docker_example",
        autoDeploy: false,
      },
      build: {
        type: "dockerfile",
        file: "Dockerfile",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7860,
        },
      ],
      basicAuth: [
        {
          username: input.username,
          password: input.password,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/home/user/app",
        },
      ],
    },
  });

  return { services };
}
