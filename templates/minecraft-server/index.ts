import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appPorts = [{ published: input.serverPort, target: input.serverPort }];
  const appEnv = [
    `EULA=${input.eula}`,
    `SERVER_PORT=${input.serverPort || "25565"}`,
    `ENABLE_RCON=${input.enableRcon}`,
  ];

  if (input.enableRcon) {
    appPorts.push({
      published: input.rconPort || 25575,
      target: input.rconPort || 25575,
    });
    appEnv.push(
      `RCON_PASSWORD=${input.rconPassword || ""}`,
      `RCON_PORT=${input.rconPort || "25575"}`
    );
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      ports: appPorts,
      env: appEnv.join("\n"),
      mounts: [{ type: "volume", name: "data", mountPath: "/data" }],
    },
  });

  return { services };
}
