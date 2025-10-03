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
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "dailytxt-data",
          mountPath: "/app/data",
        },
      ],
      env: [
        `PORT=8765`,
        `SECRET_KEY=${input.secretKey}`,
        `ALLOW_REGISTRATION=${input.allowRegistration}`,
        `DATA_INDENT=2`,
        `JWT_EXP_DAYS=${input.jwtExpDays}`,
        `ENABLE_UPDATE_CHECK=True`,
      ].join("\n"),
    },
  });

  return { services };
}
