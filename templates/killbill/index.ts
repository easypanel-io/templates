import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const rootPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `KILLBILL_DAO_URL=jdbc:mysql://$(PROJECT_NAME)_${input.appServiceName}-db:3306/killbill`,
        `KILLBILL_DAO_USER=root`,
        `KILLBILL_DAO_PASSWORD=${rootPassword}`,
        `KILLBILL_CATALOG_URI=SpyCarAdvanced.xml`,
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
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-kaui`,
      env: [
        `KAUI_CONFIG_DAO_URL=jdbc:mysql://$(PROJECT_NAME)_${input.appServiceName}-db:3306/kaui`,
        `KAUI_CONFIG_DAO_USER=root`,
        `KAUI_CONFIG_DAO_PASSWORD=${rootPassword}`,
        `KAUI_KILLBILL_URL=`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.kauiAppServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      serviceName: `${input.appServiceName}-db`,
      image: "killbill/mariadb:0.24",
      rootPassword: rootPassword,
    },
  });

  return { services };
}
