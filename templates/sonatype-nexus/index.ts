import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `INSTALL4J_ADD_VM_PARAMS="-Xms2703m -Xmx2703m -XX:MaxDirectMemorySize=2703m -Djava.util.prefs.userRoot=/nexus-data"`,
        `NEXUS_CONTEXT=/`,
      ].join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8081,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "nexus-data",
          mountPath: "/nexus-data",
        },
      ],
    },
  });

  return { services };
}
