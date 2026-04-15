import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appEnv = [`TZ=${input.timezone}`, `WEBPASSWORD=${input.webPassword}`];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
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
      ports: [
        { protocol: "tcp", published: 53, target: 53 },
        { protocol: "udp", published: 53, target: 53 },
        { protocol: "udp", published: 67, target: 67 },
      ],
      mounts: [
        {
          type: "volume",
          name: "dnsmasq",
          mountPath: "/etc/dnsmasq.d",
        },
        {
          type: "volume",
          name: "pihole",
          mountPath: "/etc/pihole",
        },
      ],
    },
  });

  return { services };
}
