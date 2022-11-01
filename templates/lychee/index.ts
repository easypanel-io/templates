import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const appEnv = [];

  if (input.databaseType === "sqlite") {
    appEnv.push(`DB_CONNECTION=sqlite`);
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "conf",
          mountPath: "/conf",
        },
        {
          type: "volume",
          name: "sym",
          mountPath: "/sym",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/uploads",
        },
      ],
    },
  });

  return { services };
}
