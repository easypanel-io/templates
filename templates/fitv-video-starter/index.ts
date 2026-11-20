import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `PORT=3000`,
        `FREEIMAGETOVIDEO_API_KEY=${input.freeimagetovideoApiKey ?? ""}`,
        `FREEIMAGETOVIDEO_MODEL=minimax-h3`,
        `ACCESS_PASSWORD=${input.accessPassword ?? ""}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  return { services };
}
