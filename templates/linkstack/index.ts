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
        `SERVER_ADMIN=${input.serverAdmin}`,
        `HTTPS_SERVER_NAME=${input.domain}`,
        `HTTP_SERVER_NAME=${input.domain}`,
        `FORCE_HTTPS=true`,
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
          name: "htdocs",
          mountPath: "/htdocs",
        },
      ],
    },
  });

  return { services };
}
