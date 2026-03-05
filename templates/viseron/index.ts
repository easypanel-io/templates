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
          port: 8888,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "segments",
          mountPath: "/segments",
        },
        {
          type: "volume",
          name: "snapshots",
          mountPath: "/snapshots",
        },
        {
          type: "volume",
          name: "thumbnails",
          mountPath: "/thumbnails",
        },
        {
          type: "volume",
          name: "event-clips",
          mountPath: "/event_clips",
        },
        {
          type: "volume",
          name: "timelapse",
          mountPath: "/timelapse",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "bind",
          hostPath: "/etc/localtime",
          mountPath: "/etc/localtime",
        },
      ],
    },
  });

  return { services };
}
