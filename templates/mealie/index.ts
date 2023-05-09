import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `DEFAULT_EMAIL=changeme@easypanel.io`,
        `TZ=UTC`,
        `BASE_URL=https://${input.domain}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "appdata",
          mountPath: "/app/data",
        },
      ],
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  return { services };
}
