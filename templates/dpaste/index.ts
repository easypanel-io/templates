import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: "darrenofficial/dpaste:latest",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      env: [
        `DATABASE_URL=sqlite:////db/dpaste.sqlite`,
        `PORT=8000`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "db",
          mountPath: "/db",
        },
      ],
    },
  });

  return { services };
} 