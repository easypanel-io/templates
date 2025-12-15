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
          port: 2480,
        },
      ],
      ports: [
        {
          published: Number(input.binaryPort),
          target: 2424,
        },
      ],
      env: [
        `JAVA_OPTS=-Darcadedb.server.rootPassword=playwithdata -Darcadedb.dumpConfigAtStartup=true -Darcadedb.server.defaultDatabases=Imported[root]{import:https://github.com/ArcadeData/arcadedb-datasets/raw/main/orientdb/OpenBeer.gz}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "arcade_db_vol",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
