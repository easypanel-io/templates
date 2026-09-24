import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const authPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        "PORT=3001",
        "AUTH_MODE=local_noauth",
        "CLOUDFLARE_INCLUDE_PROCESS_ENV=true",
        "ALLOWED_HOST=$(PRIMARY_DOMAIN)",
        "VITE_SHOW_DEVTOOLS=false",
        `DATAFORSEO_API_KEY=${input.dataforseoApiKey || ""}`,
        `OPENROUTER_API_KEY=${input.openrouterApiKey || ""}`,
        `OPENROUTER_MODEL=${input.openrouterModel || ""}`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3001,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/app/.wrangler",
        },
      ],
      basicAuth: [{ username: "admin", password: authPassword }],
    },
  });

  return { services };
}
