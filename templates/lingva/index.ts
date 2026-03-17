import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const envVars = [
    `site_domain=${input.siteDomain || "$(PRIMARY_DOMAIN)"}`,
    `force_default_theme=${input.defaultTheme ?? "light"}`,
    `default_source_lang=${input.defaultSourceLang ?? "auto"}`,
    `default_target_lang=${input.defaultTargetLang ?? "en"}`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage ?? "thedaviddelta/lingva-translate:latest",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: envVars.join("\n"),
    },
  });

  return { services };
}
