import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(32);

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `ADMIN_USERNAME=${input.adminUsername}`,
        `ADMIN_PASSWORD=${input.adminPassword}`,
        `SECRET_KEY=${secret}`,
        `MINUTES_BETWEEN_VIDEO_SCANS=5`,
        `PUID=1000`,
        `PGID=1000`,
      ].join("\n"),
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
          name: "processed",
          mountPath: "/processed",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "videos",
          mountPath: "/videos",
        },
      ],
    },
  });

  return { services };
}
