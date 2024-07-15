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
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/pb_data",
        },
        {
          type: "volume",
          name: "public",
          mountPath: "/pb_public",
        },
        {
          type: "volume",
          name: "migrations",
          mountPath: "/pb_migrations",
        },
      ],
    },
  });

  return { services };
}
