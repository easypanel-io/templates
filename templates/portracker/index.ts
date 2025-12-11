import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [];

  if (input.enableTrueNas && input.trueNasApiKey) {
    envVars.push(`TRUENAS_API_KEY=${input.trueNasApiKey}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: envVars.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4999,
        },
      ],
      deploy: {
        capAdd: ["SYS_PTRACE", "SYS_ADMIN"],
      },
    },
  });

  return { services };
}
