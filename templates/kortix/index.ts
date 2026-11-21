import { randomBytes } from "crypto";
import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

// The compose file (Kortix's self-host stack: web app, API, LLM gateway and
// Supabase) lives in https://github.com/Kortix-seo/kortix-compose, one branch per Kortix release.

export function generate(input: Input): Output {
  const services: Services = [];
  const postgres_password = randomBytes(32).toString("hex");
  const jwt_secret = randomBytes(64).toString("hex");
  const kortix_secret_seed = randomBytes(32).toString("hex");

  services.push({
    type: "compose",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "git",
        repo: "https://github.com/Kortix-seo/kortix-compose.git",
        ref: "kortix-0.14.19",
        rootPath: "/kortix",
        composeFile: "docker-compose.yml",
      },
      createDotEnv: true,
      env: [
        `POSTGRES_PASSWORD=${postgres_password}`,
        `JWT_SECRET=${jwt_secret}`,
        `KORTIX_SECRET_SEED=${kortix_secret_seed}`,
        `PUBLIC_URL=https://$(EASYPANEL_DOMAIN)`,
        `API_PUBLIC_URL=https://api-$(EASYPANEL_DOMAIN)`,
        `SUPABASE_PUBLIC_URL=https://supabase-$(EASYPANEL_DOMAIN)`,
        `PLATINUM_API_KEY=${input.platinumApiKey}`,
        `KORTIX_ADMIN_EMAIL=${input.adminEmail}`,
        `DISABLE_SIGNUP=false`,
        `EMAIL_URL=`,
        `EMAIL_FROM=`,
        `COMPOSIO_API_KEY=`,
      ].join("\n"),
      domains: [
        { host: "$(EASYPANEL_DOMAIN)", port: 3000, service: "frontend" },
        { host: "api-$(EASYPANEL_DOMAIN)", port: 8008, service: "api" },
        { host: "supabase-$(EASYPANEL_DOMAIN)", port: 8000, service: "kong" },
      ],
    },
  });

  return { services };
}
