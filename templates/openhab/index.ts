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
      env: [
        `CRYPTO_POLICY=unlimited`,
        `EXTRA_JAVA_OPTS=-Duser.timezone=Europe/Berlin`,
        `OPENHAB_HTTP_PORT=8080`,
        `OPENHAB_HTTPS_PORT=8443`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "addons",
          mountPath: "/openhab/addons",
        },
        {
          type: "volume",
          name: "conf",
          mountPath: "/openhab/conf",
        },
        {
          type: "volume",
          name: "userdata",
          mountPath: "/openhab/userdata",
        },
      ],
    },
  });

  return { services };
}
