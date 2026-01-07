import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [`PUID=1000`, `PGID=1000`, `TZ=${input.timezone}`];

  if (input.enableDockerMods) {
    envVars.push(`DOCKER_MODS=linuxserver/mods:universal-calibre`);
  }

  if (input.enableOAuthRelax) {
    envVars.push(`OAUTHLIB_RELAX_TOKEN_SCOPE=1`);
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: envVars.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8083,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "books",
          mountPath: "/books",
        },
      ],
    },
  });

  return { services };
}
