import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  type Port = { published: number; target: number; protocol: "tcp" | "udp" };
  const appPorts: Port[] = [
    {
      published: input.serverPort || 19132,
      target: input.serverPort || 19132,
      protocol: "udp",
    },
  ];
  const appEnv = [
    `VERSION=${input.version || ""}`,
    `SERVER_NAME=${input.serverName || ""}`,
    `MODE=${input.gameMode || ""}`,
    `DIFFICULTY=${input.difficulty || ""}`,
    `MAX_PLAYERS=${input.maxPlayers || ""}`,
    `VIEW_DISTANCE=${input.viewDistance || ""}`,
    `EULA=${input.eula}`,
    `SERVER_PORT=${input.serverPort || 19132}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      ports: appPorts,
      env: appEnv.join("\n"),
      mounts: [{ type: "volume", name: "data", mountPath: "/data" }],
    },
  });

  return { services };
}
