import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [
    `TZ=${input.timezone || "UTC"}`,
    `BIRDNET_UID=1000`,
    `BIRDNET_GID=1000`,
    `BIRDNET_LOCALE=${input.locale || "en-us"}`,
    `BIRDNET_SENSITIVITY=1.0`,
    `BIRDNET_THRESHOLD=0.8`,
    `BIRDNET_OVERLAP=1.5`,
    `BIRDNET_THREADS=0`,
    `BIRDNET_DEBUG=false`,
    `BIRDNET_USEXNNPACK=true`,
    `BIRDNET_RANGEFILTER_MODEL=latest`,
    `BIRDNET_RANGEFILTER_THRESHOLD=0.01`,
  ];

  if (input.latitude) {
    envVars.push(`BIRDNET_LATITUDE=${input.latitude}`);
  }

  if (input.longitude) {
    envVars.push(`BIRDNET_LONGITUDE=${input.longitude}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envVars.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
