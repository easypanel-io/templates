import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8080 }],
      env: [
        `WRITABLE_PATH=/data`,
        `MONGO_URL=mongodb://mongo:${databasePassword}@$(PROJECT_NAME)_${input.databaseServiceName}:27017`,
        `ROOT_URL=https://$(PRIMARY_DOMAIN)`,
        `MAIL_URL=${input.mailSmtpSsl ? "smtps" : "smtp"}://${
          input.mailUsername
        }:${input.mailPassword}@${input.mailHost}:${
          input.mailPort
        }/?ignoreTLS=${input.mailDisableTls}`,
        `MAIL_FROM=${input.mailFrom} <${input.mailFromSender}>`,
        `WITH_API=true`,
        `RICHER_CARD_COMMENT_EDITOR=false`,
        `CARD_OPENED_WEBHOOK_ENABLED=false`,
        `BIGEVENTS_PATTERN=NONE`,
        `BROWSER_POLICY_ENABLED=true`,
      ].join("\n"),
    },
  });

  services.push({
    type: "mongo",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
