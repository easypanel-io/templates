import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.serviceName,
      source: {
        type: "image",
        image: "filebrowser/filebrowser:latest",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [{ name: input.domain }],
      mounts: [
        { type: "bind", hostPath: "/", mountPath: "/srv" },
        { type: "volume", name: "database", mountPath: "/database" },
        {
          type: "file",
          content: JSON.stringify(
            {
              port: 80,
              baseURL: "",
              address: "",
              log: "stdout",
              database: "/database/database.db",
              root: "/srv",
            },
            null,
            2
          ),
          mountPath: "/.filebrowser.json",
        },
      ],
      deploy: {
        zeroDowntime: false,
      },
    },
  });

  return { services };
}
