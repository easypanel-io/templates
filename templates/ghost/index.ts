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
        type: "image",
        image: "ghost",
      },
      env: `url=https://${input.domain}`,
      proxy: {
        port: 2368,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
        {
          type: "volume",
          name: "content",
          mountPath: "/var/lib/ghost/content",
        },
      ],
    },
  });

  return { services };
}
