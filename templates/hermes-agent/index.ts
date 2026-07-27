import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dashboardPassword = input.dashboardPassword || randomPassword();

  const env = [
    `HERMES_DASHBOARD=1`,
    `HERMES_DASHBOARD_BASIC_AUTH_USERNAME=${input.dashboardUsername}`,
    `HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=${dashboardPassword}`,
    `GATEWAY_ALLOW_ALL_USERS=${input.gatewayAllowAllUsers ? "true" : "false"}`,
    ...(input.openRouterApiKey
      ? [`OPENROUTER_API_KEY=${input.openRouterApiKey}`]
      : []),
    ...(input.anthropicApiKey
      ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
      : []),
    ...(input.openaiApiKey ? [`OPENAI_API_KEY=${input.openaiApiKey}`] : []),
    ...(input.googleApiKey ? [`GOOGLE_API_KEY=${input.googleApiKey}`] : []),
    ...(input.deepseekApiKey
      ? [`DEEPSEEK_API_KEY=${input.deepseekApiKey}`]
      : []),
    ...(input.telegramBotToken
      ? [`TELEGRAM_BOT_TOKEN=${input.telegramBotToken}`]
      : []),
    ...(input.telegramAllowedUsers
      ? [`TELEGRAM_ALLOWED_USERS=${input.telegramAllowedUsers}`]
      : []),
    ...(input.discordBotToken
      ? [`DISCORD_BOT_TOKEN=${input.discordBotToken}`]
      : []),
    ...(input.discordAllowedUsers
      ? [`DISCORD_ALLOWED_USERS=${input.discordAllowedUsers}`]
      : []),
    ...(input.slackBotToken ? [`SLACK_BOT_TOKEN=${input.slackBotToken}`] : []),
    ...(input.slackAppToken ? [`SLACK_APP_TOKEN=${input.slackAppToken}`] : []),
    ...(input.slackAllowedUsers
      ? [`SLACK_ALLOWED_USERS=${input.slackAllowedUsers}`]
      : []),
    ...(input.whatsappAccessToken
      ? [`WHATSAPP_CLOUD_ACCESS_TOKEN=${input.whatsappAccessToken}`]
      : []),
    ...(input.whatsappPhoneNumberId
      ? [`WHATSAPP_CLOUD_PHONE_NUMBER_ID=${input.whatsappPhoneNumberId}`]
      : []),
    ...(input.whatsappAppSecret
      ? [`WHATSAPP_CLOUD_APP_SECRET=${input.whatsappAppSecret}`]
      : []),
    ...(input.whatsappVerifyToken
      ? [`WHATSAPP_CLOUD_VERIFY_TOKEN=${input.whatsappVerifyToken}`]
      : []),
    ...(input.whatsappAllowedUsers
      ? [`WHATSAPP_CLOUD_ALLOWED_USERS=${input.whatsappAllowedUsers}`]
      : []),
    ...(input.emailAddress ? [`EMAIL_ADDRESS=${input.emailAddress}`] : []),
    ...(input.emailPassword ? [`EMAIL_PASSWORD=${input.emailPassword}`] : []),
    ...(input.emailImapHost ? [`EMAIL_IMAP_HOST=${input.emailImapHost}`] : []),
    ...(input.emailImapPort ? [`EMAIL_IMAP_PORT=${input.emailImapPort}`] : []),
    ...(input.emailSmtpHost ? [`EMAIL_SMTP_HOST=${input.emailSmtpHost}`] : []),
    ...(input.emailSmtpPort ? [`EMAIL_SMTP_PORT=${input.emailSmtpPort}`] : []),
    ...(input.emailAllowedUsers
      ? [`EMAIL_ALLOWED_USERS=${input.emailAllowedUsers}`]
      : []),
  ];

  const ports = [
    {
      protocol: "tcp" as const,
      published: 9119,
      target: 9119,
    },
    {
      protocol: "tcp" as const,
      published: 8642,
      target: 8642,
    },
    ...(input.whatsappAccessToken
      ? [
          {
            protocol: "tcp" as const,
            published: 8090,
            target: 8090,
          },
        ]
      : []),
  ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: "hermes gateway run",
        replicas: 1,
        zeroDowntime: true,
      },
      env: env.join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6432,
        },
      ],
      ports,
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
