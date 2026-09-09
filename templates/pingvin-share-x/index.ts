import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

const caddyfile = `:3000 {
\treverse_proxy /api/* http://127.0.0.1:8080
\treverse_proxy http://127.0.0.1:3333
}
`;

const caddyfileTrustProxy = `:3000 {
\treverse_proxy /api/* http://127.0.0.1:8080 {
\t\ttrusted_proxies 0.0.0.0/0
\t}
\treverse_proxy /* http://127.0.0.1:3333 {
\t\ttrusted_proxies 0.0.0.0/0
\t}
}
`;

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [
        `TRUST_PROXY=${input.trustProxy ? "true" : "false"}`,
        `BACKEND_PORT=8080`,
      ].join("\n"),
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 3000 }],
      mounts: [
        { type: "volume", name: "data", mountPath: "/opt/app/backend/data" },
        {
          type: "volume",
          name: "images",
          mountPath: "/opt/app/frontend/public/img",
        },
        {
          type: "file",
          content: caddyfile,
          mountPath: "/opt/app/reverse-proxy/Caddyfile",
        },
        {
          type: "file",
          content: caddyfileTrustProxy,
          mountPath: "/opt/app/reverse-proxy/Caddyfile.trust-proxy",
        },
      ],
    },
  });

  return { services };
}
