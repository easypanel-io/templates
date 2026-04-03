import { Output, Services, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(32);

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
          port: 8088,
        },
      ],
      env: [
        `SUPERSET_SECRET_KEY=${secretKey}`,
        `SUPERSET_LOAD_EXAMPLES=yes`,
        `SUPERSET_ENABLE_PROXY_FIX=true`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "superset",
          mountPath: "/app/superset_home",
        },
      ],
    },
  });

  return { services };
}
