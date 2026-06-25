import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dashboardPassword = input.dashboardPassword || randomPassword();

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
      env: [
        `HERMES_DASHBOARD=1`,
        `HERMES_DASHBOARD_BASIC_AUTH_USERNAME=${input.dashboardUsername}`,
        `HERMES_DASHBOARD_BASIC_AUTH_PASSWORD=${dashboardPassword}`,
        `GATEWAY_ALLOW_ALL_USERS=${input.gatewayAllowAllUsers ? "true" : "false"}`,
        ...(input.anthropicApiKey
          ? [`ANTHROPIC_API_KEY=${input.anthropicApiKey}`]
          : []),
        ...(input.openaiApiKey ? [`OPENAI_API_KEY=${input.openaiApiKey}`] : []),
        ...(input.telegramBotToken
          ? [`TELEGRAM_BOT_TOKEN=${input.telegramBotToken}`]
          : []),
        ...(input.discordBotToken
          ? [`DISCORD_BOT_TOKEN=${input.discordBotToken}`]
          : []),
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 6432,
        },
      ],
      ports: [
        {
          protocol: "tcp",
          published: 9119,
          target: 9119,
        },
        {
          protocol: "tcp",
          published: 8642,
          target: 8642,
        },
      ],
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
