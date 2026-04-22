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
          port: 20211,
        },
      ],
      env: [
        `LISTEN_ADDR="0.0.0.0"`,
        `PORT="20211"`,
        `GRAPHQL_PORT="20212"`,
        `APP_CONF_OVERRIDE={"GRAPHQL_PORT":"20212"}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "bind",
          hostPath: "/etc/localtime",
          mountPath: "/etc/localtime",
        },
      ],
      deploy: {
        capAdd: ["NET_ADMIN", "NET_RAW", "NET_BIND_SERVICE"],
      },
    },
  });

  return { services };
}
