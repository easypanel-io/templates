import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [
    `SRCDS_TOKEN=${input.srcdToken}`,
    `DEBUG=0`,
    `STEAMAPPVALIDATE=0`,
    `CS2_SERVERNAME=${input.serverName}`,
    `CS2_CHEATS=0`,
    `CS2_PORT=${input.tcpPort}`,
    `CS2_SERVER_HIBERNATE=0`,
    `CS2_RCON_PORT=`,
    `CS2_LAN=0`,
    `CS2_RCONPW=${input.rconPassword}`,
    `CS2_PW=${input.serverPassword}`,
    `CS2_MAXPLAYERS=${input.maxPlayers}`,
    `CS2_ADDITIONAL_ARGS=`,
    `CS2_CFG_URL=`,
    `CS2_GAMEALIAS=${input.gameAlias}`,
    `CS2_GAMETYPE=0`,
    `CS2_GAMEMODE=1`,
    `CS2_MAPGROUP=${input.mapGroup}`,
    `CS2_STARTMAP=${input.startMap}`,
    `CS2_HOST_WORKSHOP_COLLECTION=`,
    `CS2_HOST_WORKSHOP_MAP=`,
    `CS2_BOT_DIFFICULTY=`,
    `CS2_BOT_QUOTA=`,
    `CS2_BOT_QUOTA_MODE=`,
    `TV_AUTORECORD=0`,
    `TV_ENABLE=0`,
    `TV_PORT=${input.udpPort}`,
    `TV_PW=changeme`,
    `TV_RELAY_PW=changeme`,
    `TV_MAXRATE=0`,
    `TV_DELAY=0`,
    `CS2_LOG=on`,
    `CS2_LOG_MONEY=0`,
    `CS2_LOG_DETAIL=0`,
    `CS2_LOG_ITEMS=0`,
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envVars,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        capAdd: ["NET_ADMIN"],
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      ports: [
        {
          published: parseInt(input.tcpPort),
          target: 27015,
          protocol: "tcp",
        },
        {
          published: parseInt(input.tcpPort),
          target: 27015,
          protocol: "udp",
        },
        {
          published: parseInt(input.udpPort),
          target: 27020,
          protocol: "udp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "cs2-data",
          mountPath: "/home/steam/cs2-dedicated/",
        },
      ],
    },
  });

  return { services };
}
