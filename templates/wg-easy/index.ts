import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [`WG_HOST=$(PRIMARY_DOMAIN)`, `PASSWORD=${input.appPassword}`].join(
        "\n"
      ),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 50921,
        },
      ],
      ports: [
        {
          protocol: "udp",
          published: 51820,
          target: 51820,
        },
        {
          protocol: "tcp",
          published: 51821,
          target: 51821,
        },
      ],
      deploy: {
        sysctls: {
          "net.ipv4.conf.all.src_valid_mark": "1",
          "net.ipv4.ip_forward": "1",
        },
        capAdd: ["NET_ADMIN", "SYS_MODULE"],
      },
    },
  });

  return { services };
}
