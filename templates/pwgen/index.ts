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
        `NO_API_CHECK=${input.noApiCheck ? "true" : "false"}`,
        `PW_LENGTH=${input.pwLength ?? 12}`,
        `PW_INCLUDE_UPPERCASE=${input.pwIncludeUppercase ? "true" : "false"}`,
        `PW_INCLUDE_DIGITS=${input.pwIncludeDigits ? "true" : "false"}`,
        `PW_INCLUDE_SPECIAL=${input.pwIncludeSpecial ? "true" : "false"}`,
        `MULTI_GEN=${input.multiGen ? "true" : "false"}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5069,
        },
      ],
    },
  });

  return { services };
}
