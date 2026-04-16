import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const command = input.gatewayMode ? "gateway run" : "sleep infinity";

  // Auto-generate a strong API server key if none provided
  const apiServerKey = input.apiServerKey || randomPassword();

  const domains: Array<{ host: string; port: number }> = [];

  if (input.apiServerEnabled) {
    domains.push({ host: "$(EASYPANEL_DOMAIN)", port: 8642 });
  }

  // MCPorter OAuth callback port.
  // SECURITY NOTE: This port is only safe to expose while actively running
  // an OAuth flow (mcporter auth). The port should be disabled (redeploy with
  // mcporterOauthEnabled: false) immediately after the OAuth token is obtained.
  // Leaving it permanently open exposes an unauthenticated HTTP endpoint that
  // could be used to hijack in-progress OAuth flows.
  if (input.mcporterOauthEnabled) {
    domains.push({ host: "$(EASYPANEL_DOMAIN)", port: 3000 });
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command,
      },
      env: [
        `PATH=/opt/hermes/.venv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
        `HERMES_HOME=/opt/data`,

        // API server — OpenAI-compatible endpoint on port 8642.
        // Protected by API_SERVER_KEY (Bearer token). Always use HTTPS
        // (Easypanel's Traefik provides TLS termination).
        // The key is auto-generated if not supplied so the endpoint is
        // never accidentally left open without authentication.
        ...(input.apiServerEnabled
          ? [
              `API_SERVER_ENABLED=true`,
              `API_SERVER_HOST=0.0.0.0`,
              `API_SERVER_PORT=8642`,
              `API_SERVER_KEY=${apiServerKey}`,
            ]
          : []),

        // MCPorter OAuth callback — temporary use only.
        // Set MCPORTER_OAUTH_REDIRECT_HOST so mcporter builds a redirect_uri
        // pointing to this container's public domain rather than localhost.
        // After completing OAuth, redeploy with mcporterOauthEnabled: false
        // to close port 3000.
        ...(input.mcporterOauthEnabled && input.mcporterCallbackHost
          ? [`MCPORTER_OAUTH_REDIRECT_HOST=${input.mcporterCallbackHost}`]
          : []),

        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey
          ? [`OPENAI_API_KEY=${input.openaiApiKey}`]
          : []),
        ...(input.telegramBotToken
          ? [`TELEGRAM_BOT_TOKEN=${input.telegramBotToken}`]
          : []),
        ...(input.discordBotToken
          ? [`DISCORD_BOT_TOKEN=${input.discordBotToken}`]
          : []),
      ].join("\n"),
      ...(domains.length > 0 ? { domains } : {}),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/opt/data",
        },
      ],
    },
  });

  return { services };
}
