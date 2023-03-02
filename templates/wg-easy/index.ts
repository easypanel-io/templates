import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const sysctl = ["hi"];

  const serviceVariables = [
    `WG_HOST=${input.appDomain}`,
    `PASSWORD=${input.appPassword}`,
  ];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: serviceVariables.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 50921,
        secure: true,
      },
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
      domains: [
        {
          name: input.appDomain,
        },
      ],
      deploy: {
        // this is how to use sysctls
        sysctls: {
          a: "net.ipv4.conf.all.src_valid_mark=1",
          b: "net.ipv4.ip_forward=1",
        },
        // this is how to use capadd
        capAdd: ["NET_ADMIN", "SYS_MODULE"],
      },
    },
  });

  return { services };
}
