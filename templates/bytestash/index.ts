import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const jwtSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `BASE_PATH=`,
        `JWT_SECRET=${jwtSecret}`,
        `TOKEN_EXPIRY=24h`,
        `ALLOW_NEW_ACCOUNTS=true`,
        `DEBUG=true`,
        `DISABLE_ACCOUNTS=false`,
        `DISABLE_INTERNAL_ACCOUNTS=false`,
        `OIDC_ENABLED=false`,
        `OIDC_DISPLAY_NAME=`,
        `OIDC_ISSUER_URL=`,
        `OIDC_CLIENT_ID=`,
        `OIDC_CLIENT_SECRET=`,
        `OIDC_SCOPES=`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "snippets",
          mountPath: "/data/snippets",
        },
      ],
    },
  });

  return { services };
}
