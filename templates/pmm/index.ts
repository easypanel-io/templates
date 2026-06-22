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
        `PMM_DATA_RETENTION=${input.pmmDataRetention}`,
        `PMM_METRICS_RESOLUTION=${input.pmmMetricsResolution}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "pmm-data",
          mountPath: "/srv",
        },
      ],
    },
  });

  return { services };
}
