import { randomBytes } from "crypto";
import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const dbPassword = randomPassword();
  const redisPassword = randomPassword();
  const dbServiceName = `${input.appServiceName}-db`;
  const redisServiceName = `${input.appServiceName}-redis`;

  const appKey = `base64:${randomBytes(32).toString("base64")}`;
  const anonaddySecret = randomString(32);

  const mailpitServiceName = `${input.appServiceName}-mailpit`;
  const mailpitEnabled = input.enableMailpit !== false;

  const relayEnv: string[] = [];
  if (input.smtpRelayHost) {
    relayEnv.push(`POSTFIX_RELAYHOST=${input.smtpRelayHost}`);
    if (input.smtpRelayUsername && input.smtpRelayPassword) {
      relayEnv.push(`POSTFIX_RELAYHOST_AUTH_ENABLE=true`);
      relayEnv.push(`POSTFIX_RELAYHOST_USERNAME=${input.smtpRelayUsername}`);
      relayEnv.push(`POSTFIX_RELAYHOST_PASSWORD=${input.smtpRelayPassword}`);
    }
  } else if (mailpitEnabled) {
    relayEnv.push(
      `POSTFIX_RELAYHOST=[$(PROJECT_NAME)_${mailpitServiceName}]:1025`
    );
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `APP_KEY=${appKey}`,
        `APP_DEBUG=false`,
        `APP_URL=https://$(EASYPANEL_DOMAIN)`,
        `ANONADDY_RETURN_PATH=bounces@${input.domain}`,
        `ANONADDY_ADMIN_USERNAME=${input.adminUsername}`,
        `ANONADDY_ENABLE_REGISTRATION=true`,
        `ANONADDY_DOMAIN=${input.domain}`,
        `ANONADDY_ALL_DOMAINS=${input.domain}`,
        `ANONADDY_HOSTNAME=${input.hostname}`,
        `ANONADDY_DNS_RESOLVER=127.0.0.1`,
        `ANONADDY_SECRET=${anonaddySecret}`,
        `MAIL_FROM_NAME=addy.io`,
        `MAIL_FROM_ADDRESS=addy@${input.domain}`,
        `POSTFIX_SMTPD_TLS=false`,
        `POSTFIX_SMTP_TLS=false`,
        ...relayEnv,
        `DB_HOST=$(PROJECT_NAME)_${dbServiceName}`,
        `DB_DATABASE=$(PROJECT_NAME)`,
        `DB_USERNAME=addy`,
        `DB_PASSWORD=${dbPassword}`,
        `REDIS_HOST=$(PROJECT_NAME)-${redisServiceName}`,
        `REDIS_PASSWORD=${redisPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8000,
        },
      ],
      ports: [
        {
          protocol: "tcp",
          published: 25,
          target: 25,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: dbServiceName,
      databaseName: "$(PROJECT_NAME)",
      user: "addy",
      password: dbPassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisServiceName,
      password: redisPassword,
    },
  });

  if (mailpitEnabled) {
    services.push({
      type: "app",
      data: {
        serviceName: mailpitServiceName,
        source: {
          type: "image",
          image: "axllent/mailpit:v1.20",
        },
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 8025,
          },
        ],
      },
    });
  }

  return { services };
}
