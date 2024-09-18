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
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/config",
        },
        {
          type: "volume",
          name: "db",
          mountPath: "/db",
        },
        {
          type: "volume",
          name: "tmp",
          mountPath: "/tmp",
        },
        {
          type: "file",
          content: [
            "[general]",
            `host = https://$(PRIMARY_DOMAIN)`,
            "max-age = 15m",
            "notify = stdout",
            "gravatar = true",
            "gravatar-url = https://www.gravatar.com/avatar/{}?d=identicon&s=55",
            "latest-enabled = false",
            "[admin]",
            "enabled = true",
            `password = ${input.adminPassword}`,
            "[moderation]",
            "enabled = false",
            "approve-if-email-previously-approved = false",
            "purge-after = 30d",
            "[guard]",
            "enabled = true",
            "ratelimit = 2",
            "direct-reply = 3",
            "reply-to-self = false",
            "require-author = false",
            "require-email = false",
          ].join("\n"),
          mountPath: "/config/isso.cfg",
        },
      ],
    },
  });

  return { services };
}
