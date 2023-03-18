import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const appPorts = [
    {
      published: input.serverPort || 25565,
      target: input.serverPort || 25565,
      protocol: "tcp",
    },
  ];
  const appEnv = [
    `VERSION=${input.version || ""}`,
    `TYPE=${input.type || ""}`,
    `SERVER_NAME=${input.serverName || ""}`,
    `MOTD=${input.motd || ""}`,
    `ICON=${input.iconUrl || ""}`,
    `DIFFICULTY=${input.difficulty || ""}`,
    `MAX_PLAYERS=${input.maxPlayers || ""}`,
    `MAX_WORLD_SIZE=${input.maxWorldSize || ""}`,
    `EULA=${input.eula}`,
    `ALLOW_NETHER=${input.allowNether}`,
    `ANNOUNCE_PLAYER_ACHIEVEMENTS=${input.announcePlayerAchievements}`,
    `ENABLE_COMMAND_BLOCK=${input.enableCommandBlock}`,
    `HARDCORE=${input.hardcore}`,
    `SPAWN_ANIMALS=${input.spawnAnimals}`,
    `SPAWN_MONSTERS=${input.spawnMonsters}`,
    `SPAWN_NPCS=${input.spawnNpcs}`,
    `SNOOPER_ENABLED=${input.snooperEnabled}`,
    `ONLINE_MODE=${input.onlineMode}`,
    `ENABLE_RCON=${input.enableRcon}`,
    `ENABLE_QUERY=${input.enableQuery}`,
    `SERVER_PORT=${input.serverPort || 25565}`,
  ];

  if (input.enableQuery) {
    appEnv.push(`QUERY_PORT=${input.queryPort || 25565}`);
    appPorts.push({
      published: input.queryPort || 25565,
      target: input.queryPort || 25565,
      protocol: "udp",
    });
  }

  if (input.enableRcon) {
    appEnv.push(
      `RCON_PORT=${input.rconPort || 25575}`,
      `RCON_PASSWORD=${input.rconPassword || randomString(10)}`
    );
    appPorts.push({
      published: input.rconPort || 25575,
      target: input.rconPort || 25575,
      protocol: "tcp",
    });
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
