import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secretKey = randomString(64);

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
          port: 7575,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "homarr-configs",
          mountPath: "/app/data/configs",
        },
        {
          type: "volume",
          name: "homarr-icons",
          mountPath: "/app/public/icons",
        },
        {
          type: "volume",
          name: "homarr-data",
          mountPath: "/data",
        },
      ],
      env: [`SECRET_ENCRYPTION_KEY=${secretKey}`, `TZ=${input.timezone}`].join(
        "\n"
      ),
    },
  });

  return { services };
}
