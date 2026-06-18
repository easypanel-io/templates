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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "dailytxt-data",
          mountPath: "/data",
        },
      ],
      env: [
        `SECRET_TOKEN=${secretKey}`,
        `ALLOW_REGISTRATION=${input.allowRegistration}`,
        `LOGOUT_AFTER_DAYS=${input.logoutAfterDays}`,
      ].join("\n"),
    },
  });

  return { services };
}
