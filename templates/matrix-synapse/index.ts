import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: input.domain ? [{ name: input.domain }] : [],
      proxy: { port: 8008, secure: true },
      env: [
        `SYNAPSE_SERVER_NAME=${input.domain || "localhost"}`,
        `SYNAPSE_REPORT_STATS=${input.reportStats ? "yes" : "no"}`,
      ].join("\n"),
      mounts: [{ type: "volume", name: "data", mountPath: "/data" }],
      deploy: { command: `/start.py generate && /start.py` },
    },
  });

  return { services };
}
