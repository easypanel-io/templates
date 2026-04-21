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
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      env: [
        `PIGEON_BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `PIGEON_AUDIO_FILE_PATH=/data/audio/`,
        `PIGEON_VIDEO_FILE_PATH=/data/video/`,
        `PIGEON_COVER_FILE_PATH=/data/cover/`,
        `SPRING_DATASOURCE_URL=jdbc:sqlite:/data/pigeon-pod.db`,
      ].join("\n"),
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
