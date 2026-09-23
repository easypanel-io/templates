import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const config = `
ui = true

storage "file" {
  path = "/bao/data"
}

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = "true"
}

api_addr     = "http://0.0.0.0:8200"
cluster_addr = "http://0.0.0.0:8201"
`.trim();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "bao server -config=/bao/config/config.hcl",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8200,
        },
      ],
      env: [`BAO_SKIP_VERIFY=true`].join("\n"),
      mounts: [
        {
          type: "file",
          content: config,
          mountPath: "/bao/config/config.hcl",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/bao/data",
        },
      ],
    },
  });

  return { services };
}
