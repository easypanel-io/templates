import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `HABITS_STORAGE=USER_DISK`,
        `TRUSTED_LOCAL_EMAIL=${input.trustedLocalEmail}`,
        `INDEX_HABIT_DATE_COLUMNS=5`,
        `ENABLE_IOS_STANDALONE=true`,
      ].join("\n"),
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
          name: "data",
          mountPath: "/app/.user",
        },
      ],
    },
  });

  return { services };
}
