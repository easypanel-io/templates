import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appSecret = input.appSecret || randomString(64);

  const env = [
    `TZ=${input.timezone || "UTC"}`,
    `APP_SECRET=${appSecret}`,
    `BASE_URL=${input.baseUrl || "https://$(PRIMARY_DOMAIN)"}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4096,
        },
      ],
      env: env.join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/zerobyte",
        },
      ],
      deploy: {
        capAdd: ["SYS_ADMIN"],
      },
    },
  });

  return { services };
}

