import { Output, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const encryptionKey = require("crypto").randomBytes(32).toString("hex");
  const automationCronSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "github",
        owner: "ArnasDon",
        repo: "wacrm",
        ref: "main",
        path: "/",
        autoDeploy: false,
      },
      build: { type: "dockerfile" },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: [
        `NEXT_PUBLIC_SUPABASE_URL=${input.supabaseUrl}`,
        `NEXT_PUBLIC_SUPABASE_ANON_KEY=${input.supabaseAnonKey}`,
        `NEXT_PUBLIC_SITE_URL=https://$(PRIMARY_DOMAIN)`,
        `NEXT_PUBLIC_APP_LOCALE=${input.appLocale || "en"}`,
        `SUPABASE_SERVICE_ROLE_KEY=${input.supabaseServiceRoleKey}`,
        `ENCRYPTION_KEY=${encryptionKey}`,
        `META_APP_SECRET=${input.metaAppSecret}`,
        `META_APP_ID=${input.metaAppId || ""}`,
        `AUTOMATION_CRON_SECRET=${automationCronSecret}`,
      ].join("\n"),
    },
  });

  return { services };
}
