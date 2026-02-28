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
          port: 4096,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: "/etc/localtime",
          mountPath: "/etc/localtime",
          readOnly: true,
        },
        {
          type: "bind",
          hostPath: "/var/lib/ironmount",
          mountPath: "/var/lib/ironmount",
        },
      ],
      deploy: {
        capAdd: ["SYS_ADMIN"],
      },
    },
  });

  return { services };
}
