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
        `USER_ID=1000`,
        `GROUP_ID=1000`,
        `ALLOW_DIRECT_VNC=true`,
        `LC_ALL=en_US.UTF-8`,
        `LANG=en_US.UTF-8`,
        `PASSWORD=${input.password}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "tinymediamanager-data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "tinymediamanager-movies",
          mountPath: "/media/movies",
        },
        {
          type: "volume",
          name: "tinymediamanager-tvshows",
          mountPath: "/media/tv_shows",
        },
      ],
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4000,
        },
      ],
    },
  });

  return { services };
}
