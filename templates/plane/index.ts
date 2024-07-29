import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "compose",
    data: {
      projectName: input.projectName,
      serviceName: input.serviceName,
      source: {
        type: "git",
        repo: "git@github.com:easypanel-io/compose.git",
        ref: "main",
        rootPath: "/plane/code",
        composeFile: "docker-compose.yml",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
          service: "proxy",
        },
      ],
    },
  });

  return { services };
}
