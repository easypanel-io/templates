import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  // Generate ANON and SERVICE_ROLE JWTs signed with the JWT secret
  // These are standard HS256 JWTs with role claims
  const anonPayload = Buffer.from(
    JSON.stringify({
      role: "anon",
      iss: "supabase",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 315360000, // 10 years
    })
  ).toString("base64url");

  const servicePayload = Buffer.from(
    JSON.stringify({
      role: "service_role",
      iss: "supabase",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 315360000, // 10 years
    })
  ).toString("base64url");

  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" })
  ).toString("base64url");

  services.push({
    type: "compose",
    data: {
      serviceName: input.serviceName,
      source: {
        type: "git",
        repo: "https://github.com/easypanel-io/compose.git",
        ref: "19-01-2026",
        rootPath: "/supabase/code",
        composeFile: "docker-compose.yml",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
          service: "kong",
        },
      ],
      env: [
        `POSTGRES_PASSWORD=${input.postgresPassword}`,
        `DASHBOARD_USERNAME=supabase`,
        `DASHBOARD_PASSWORD=${input.dashboardPassword}`,
        `JWT_SECRET=${input.jwtSecret}`,
        `SECRET_KEY_BASE=${randomPassword()}${randomPassword()}`,
        `VAULT_ENC_KEY=${randomPassword().slice(0, 32)}`,
        `PG_META_CRYPTO_KEY=${randomPassword().slice(0, 32)}`,
        `LOGFLARE_PUBLIC_ACCESS_TOKEN=${randomPassword()}`,
        `LOGFLARE_PRIVATE_ACCESS_TOKEN=${randomPassword()}`,
        `POOLER_TENANT_ID=${randomPassword().slice(0, 16)}`,
      ].join("\n"),
    },
  });

  return { services };
}