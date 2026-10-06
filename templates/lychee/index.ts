import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const crypto = require("crypto");
  const appKey = `base64:${crypto.randomBytes(32).toString("base64")}`;

  const appEnv = [`APP_KEY=${appKey}`];

  if (input.databaseType === "sqlite") {
    appEnv.push(`DB_CONNECTION=sqlite`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: appEnv.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
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
