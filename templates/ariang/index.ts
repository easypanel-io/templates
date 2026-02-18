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
          port: 8080,
        },
      ],
      env: [
        "PUID=1000",
        "PGID=1000",
        `RPC_SECRET=${input.rpcSecret}`,
        "ARIA2RPCPORT=443",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: `download-data`,
          mountPath: "/aria2/data",
        },
        {
          type: "volume",
          name: `config-data`,
          mountPath: "/aria2/conf",
        },
      ],
    },
  });

  return { services };
}
