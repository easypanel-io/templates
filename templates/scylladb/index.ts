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
      ports: [
        {
          published: Number(input.cqlPort),
          target: 9042,
          protocol: "tcp",
        },
        {
          published: Number(input.thriftPort),
          target: 9160,
          protocol: "tcp",
        },
        {
          published: Number(input.rpcPort),
          target: 7000,
          protocol: "tcp",
        },
        {
          published: Number(input.rpcSslPort),
          target: 7001,
          protocol: "tcp",
        },
        {
          published: Number(input.restPort),
          target: 10000,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "scylla-data",
          mountPath: "/var/lib/scylla/data",
        },
        {
          type: "volume",
          name: "scylla-commitlog",
          mountPath: "/var/lib/scylla/commitlog",
        },
      ],
    },
  });

  return { services };
}
