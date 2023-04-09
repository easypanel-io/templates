import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: { port: 80, secure: true },
      env: [
        `ROUNDCUBEMAIL_DEFAULT_HOST=${input.roundcubeDefaultHost}`,
        `ROUNDCUBEMAIL_DEFAULT_PORT=${input.roundcubeDefaultPort}`,
        `ROUNDCUBEMAIL_SMTP_SERVER=${input.roundcubeSmtpServer}`,
        `ROUNDCUBEMAIL_SMTP_PORT=${input.roundcubeSmtpPort}`,
        `ROUNDCUBEMAIL_PLUGINS=${input.roundcubePlugins}`,
        `ROUNDCUBEMAIL_UPLOAD_MAX_FILESIZE=${input.roundcubeUploadMaxFilesize}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "html",
          mountPath: "/var/www/html",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/var/roundcube/config",
        },
        {
          type: "volume",
          name: "db",
          mountPath: "/var/roundcube/db",
        },
      ],
    },
  });

  return { services };
}
