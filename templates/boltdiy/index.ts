import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "github",
        owner: "stackblitz-labs",
        repo: "bolt.diy",
        ref: "main",
        path: "/",
        autoDeploy: false,
      },
      build: {
        type: "dockerfile",
      },
      env: [
        "NODE_ENV=production",
        "HOST=0.0.0.0",
        "PORT=5173",
        "RUNNING_IN_DOCKER=true",
        "WRANGLER_SEND_METRICS=false",
      ].join("\n"),
      deploy: {
        command: [
          "mkdir -p /etc/ssl/certs",
          `node -e "require('fs').writeFileSync('/etc/ssl/certs/ca-certificates.crt', require('tls').rootCertificates.join(String.fromCharCode(10)))"`,
          "sed -i 's/server: {/server: { allowedHosts: true,/' vite.config.ts",
          "exec pnpm run dockerstart",
        ].join(" && "),
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5173,
        },
      ],
    },
  });

  return { services };
}
