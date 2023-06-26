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
      proxy: {
        port: 7860,
        secure: true,
      },
      deploy: {
        replicas: 1,
        command: null,
        zeroDowntime: true,
      },
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
