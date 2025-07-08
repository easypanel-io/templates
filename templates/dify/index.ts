import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "compose",
    data: {
      serviceName: input.serviceName,
      source: {
        type: "git",
        repo: "https://github.com/easypanel-io/compose.git",
        ref: "03-07-2025",
        rootPath: "/dify/code",
        composeFile: "docker-compose.yaml",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
          service: "nginx",
        },
      ],
    },
  });

  return { services };
}
