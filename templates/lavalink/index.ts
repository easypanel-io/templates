import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const applicationYml = `server:
  port: 2333
  address: 0.0.0.0
lavalink:
  server:
    password: "${input.password}"
    sources:
      youtube: false
      bandcamp: true
      soundcloud: true
      twitch: true
      vimeo: true
      nico: true
      http: true
      local: false
`;

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
          port: 2333,
        },
      ],
      mounts: [
        {
          type: "file",
          content: applicationYml,
          mountPath: "/opt/Lavalink/application.yml",
        },
        {
          type: "volume",
          name: "plugins",
          mountPath: "/opt/Lavalink/plugins",
        },
      ],
    },
  });

  return { services };
}
