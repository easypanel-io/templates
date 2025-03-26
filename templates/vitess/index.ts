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
        `NUM_SHARDS=2,1`,
        `KEYSPACES=test,unsharded `,
        `MYSQL_MAX_CONNECTIONS=70000`,
        `MYSQL_BIND_HOST=0.0.0.0`,
        `VTCOMBO_BIND_HOST=0.0.0.0`,
      ].join("\n"),
      ports: [
        {
          protocol: "tcp",
          published: 33574,
          target: 33574,
        },
        {
          protocol: "tcp",
          published: 33574,
          target: 33574,
        },
        {
          protocol: "tcp",
          published: 33574,
          target: 33574,
        },
      ],
    },
  });

  return { services };
}
