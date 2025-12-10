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
  const elkarKey = randomString();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `SYMFONY__DATABASE__HOST=$(PROJECT_NAME)_${input.appServiceName}-mysql`,
        `SYMFONY__DATABASE__PORT=3306`,
        `SYMFONY__DATABASE__NAME=$(PROJECT_NAME)`,
        `SYMFONY__DATABASE__USER=root`,
        `SYMFONY__DATABASE__PASSWORD=${databasePassword}`,
        `EB_CRON=enabled`,
        `SYMFONY__MAILER__TRANSPORT=smtp`,
        `SYMFONY__MAILER__HOST=localhost`,
        `SYMFONY__MAILER__USER=null`,
        `SYMFONY__MAILER__PASSWORD=null`,
        `SYMFONY__MAILER__FROM=`,
        `SYMFONY__EB__SECRET=${elkarKey}`,
        `SYMFONY__EB__UPLOAD__DIR=/app/uploads`,
        `SYMFONY__EB__BACKUP__DIR=/app/backups`,
        `SYMFONY__EB__TMP__DIR=/app/tmp`,
        `SYMFONY__EB__URL__PREFIX=`,
        `SYMFONY__EB__PUBLIC__KEY=/app/.ssh/id_rsa.pub`,
        `SYMFONY__EB__MAX__PARALLEL__JOBS=1`,
        `SYMFONY__EB__POST__ON__PRE__FAIL=true`,
      ].join("\n"),
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
      mounts: [
        {
          type: "volume",
          name: "backups",
          mountPath: "/app/backups",
        },
        {
          type: "volume",
          name: "uploads",
          mountPath: "/app/uploads",
        },
        {
          type: "volume",
          name: "sshkeys",
          mountPath: "/app/.ssh",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      serviceName: `${input.appServiceName}-mysql`,
      image: "mysql:5.7.22",
      password: databasePassword,
      rootPassword: databasePassword,
    },
  });

  return { services };
}
