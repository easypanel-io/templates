import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      env: [
        `SITE_TITLE=FlashPaper :: Self-Destructing Message`,
        `SITE_LOGO=img/logo.png`,
        `DISPLAY_LOGO=false`,
        `DISPLAY_TITLE=true`,
        `RETURN_FULL_URL=true`,
        `BASE_URL=https://$(PRIMARY_DOMAIN)`,
        `MAX_SECRET_LENGTH=3000`,
        `ANNOUNCEMENT=`,
        `MESSAGES_ERROR_SECRET_TOO_LONG=Input length too long`,
        `MESSAGES_SUBMIT_SECRET_HEADER=Create A Self-Destructing Message`,
        `MESSAGES_SUBMIT_SECRET_SUBHEADER=`,
        `MESSAGES_SUBMIT_SECRET_BUTTON=Encrypt Message`,
        `MESSAGES_VIEW_CODE_HEADER=Self-Destructing URL`,
        `MESSAGES_VIEW_CODE_SUBHEADER=Share this URL via email, chat, or another messaging service. It will self-destruct after being viewed once.`,
        `MESSAGES_CONFIRM_VIEW_SECRET_HEADER=View this secret?`,
        `MESSAGES_CONFIRM_VIEW_SECRET_BUTTON=View Secret`,
        `MESSAGES_VIEW_SECRET_HEADER=Self-Destructing Message`,
        `MESSAGES_VIEW_SECRET_SUBHEADER=This message has been destroyed`,
        `PRUNE_ENABLED=true`,
        `PRUNE_MIN_DAYS=365`,
        `PRUNE_MAX_DAYS=730`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/www/html/data",
        },
      ],
    },
  });

  return { services };
}
