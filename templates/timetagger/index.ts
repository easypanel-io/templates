import { bcryptHash, Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const credentials = `${input.authUsername}:${bcryptHash(input.authPassword)}`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        "TIMETAGGER_BIND=0.0.0.0:80",
        "TIMETAGGER_DATADIR=/data",
        "TIMETAGGER_LOG_LEVEL=info",
        `TIMETAGGER_CREDENTIALS=${credentials}`,
      ].join("\n"),
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
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
