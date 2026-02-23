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
        image: input.appServiceImage,
      },
      env: [
        `RABBITMQ_DEFAULT_VHOST=${input.defaultVhost}`,
        `RABBITMQ_DEFAULT_USER=${input.defaultUser}`,
        `RABBITMQ_DEFAULT_PASS=${input.defaultPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 15672,
        },
      ],
      ports: [
        {
          published: Number(input.defaultAMQPPort),
          target: 5672,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "rabbitmq_data",
          mountPath: "/var/lib/rabbitmq",
        },
      ],
    },
  });

  return { services };
}
