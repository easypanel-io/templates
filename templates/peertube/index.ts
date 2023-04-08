import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const redisPassword = randomPassword();

  const appEnv = [
    `PEERTUBE_WEBSERVER_HOSTNAME=${input.domain}`,
    `PEERTUBE_SECRET=${randomString(32)}`,
    `PEERTUBE_DB_NAME=${input.projectName}`,
    `PEERTUBE_DB_HOSTNAME=${input.projectName}_${input.databaseServiceName}`,
    `PEERTUBE_DB_USERNAME=postgres`,
    `PEERTUBE_DB_PASSWORD=${databasePassword}`,
    `PEERTUBE_REDIS_HOSTNAME=${input.projectName}_${input.redisServiceName}`,
    `PEERTUBE_REDIS_AUTH=${redisPassword}`,
    `PEERTUBE_ADMIN_EMAIL=${input.peertubeAdminMail}`,
    `PEERTUBE_SIGNUP_ENABLED=${input.peertubeSignupEnabled}`,
    `PEERTUBE_TRANSCODING_ENABLED=${input.peertubeTranscodingEnabled}`,
    `PEERTUBE_CONTACT_FORM_ENABLED=${input.peertubeContactFormEnabled}`,
  ];

  if (input.peertubeSmtpHostname) {
    appEnv.push(
      `PEERTUBE_SMTP_HOSTNAME=${input.peertubeSmtpHostname}`,
      `PEERTUBE_SMTP_PORT=${input.peertubeSmtpPort || ""}`,
      `PEERTUBE_SMTP_USERNAME=${input.peertubeSmtpUsername || ""}`,
      `PEERTUBE_SMTP_PASSWORD=${input.peertubeSmtpPassword || ""}`,
      `PEERTUBE_SMTP_FROM=${input.peertubeSmtpFrom || ""}`,
      `PEERTUBE_SMTP_TLS=${input.peertubeSmtpTls}`,
      `PEERTUBE_SMTP_DISABLE_STARTTLS=${input.peertubeSmtpDisableStarttls}`
    );
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      proxy: { port: 9000, secure: true },
      domains: [{ name: input.domain }],
      env: appEnv.join("\n"),
      mounts: [
        { type: "volume", name: "assets", mountPath: "/app/client/dist" },
        { type: "volume", name: "data", mountPath: "/data" },
        { type: "volume", name: "config", mountPath: "/config" },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  services.push({
    type: "redis",
    data: {
      projectName: input.projectName,
      serviceName: input.redisServiceName,
      password: redisPassword,
    },
  });

  return { services };
}
