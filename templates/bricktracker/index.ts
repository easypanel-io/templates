import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const env = [
    `BK_DATABASE_PATH=/data/app.db`,
    `BK_RETIRED_SETS_PATH=/data/retired_sets.csv`,
    `BK_THEMES_PATH=/data/themes.csv`,
  ];

  if (input.rebrickableApiKey) {
    env.push(`BK_REBRICKABLE_API_KEY=${input.rebrickableApiKey}`);
  }

  if (input.authenticationPassword) {
    env.push(`BK_AUTHENTICATION_PASSWORD=${input.authenticationPassword}`);
    env.push(`BK_AUTHENTICATION_KEY=${input.authenticationPassword}`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: env.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3333,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
        {
          type: "volume",
          name: "instructions",
          mountPath: "/app/static/instructions",
        },
        {
          type: "volume",
          name: "minifigures",
          mountPath: "/app/static/minifigures",
        },
        {
          type: "volume",
          name: "parts",
          mountPath: "/app/static/parts",
        },
        {
          type: "volume",
          name: "sets",
          mountPath: "/app/static/sets",
        },
      ],
    },
  });

  return { services };
}
