import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // An empty value counts as unset in Legejo; the optional settings are
  // listed so they can be filled in from the Environment tab.
  const env = [
    `LEGEJO_ADMIN_USER=${input.adminUser}`,
    `LEGEJO_ADMIN_PASSWORD=${randomPassword()}`,
    `LEGEJO_PUBLIC_URL=https://$(PRIMARY_DOMAIN)`,
    `LEGEJO_SMTP_HOST=`,
    `LEGEJO_SMTP_PORT=587`,
    `LEGEJO_SMTP_USER=`,
    `LEGEJO_SMTP_PASSWORD=`,
    `LEGEJO_MAIL_FROM=`,
    `LEGEJO_FULLTEXT=`,
    `LEGEJO_MCP=false`,
    `LEGEJO_AI_API_KEY=`,
    `LEGEJO_OIDC_ISSUER=`,
    `LEGEJO_OIDC_CLIENT_ID=`,
    `LEGEJO_OIDC_CLIENT_SECRET=`,
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: env.join("\n"),
      source: { type: "image", image: input.appServiceImage },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  return { services };
}
