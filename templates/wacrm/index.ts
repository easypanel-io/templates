import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const encryptionKey = Array.from(
    { length: 64 },
    () => "0123456789abcdef"[Math.floor(Math.random() * 16)]
  ).join("");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        "PORT=3000",
        "NEXT_PUBLIC_SITE_URL=https://$(PRIMARY_DOMAIN)",
        `NEXT_PUBLIC_APP_LOCALE=${input.appLocale}`,
        `NEXT_PUBLIC_SUPABASE_URL=${input.supabaseUrl}`,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${input.supabaseAnonKey}`,
        `SUPABASE_SERVICE_ROLE_KEY=${input.supabaseServiceRoleKey}`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `META_APP_SECRET=${input.metaAppSecret || ""}`,
        `META_APP_ID=${input.metaAppId || ""}`,
        `AUTOMATION_CRON_SECRET=${randomString(64)}`,
      ].join("\n"),
      source: {
        type: "github",
        owner: "ArnasDon",
        repo: "wacrm",
        ref: input.appGitRef,
        path: "/",
        autoDeploy: false,
      },
      build: {
        type: "dockerfile",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
    },
  });

  return { services };
}
