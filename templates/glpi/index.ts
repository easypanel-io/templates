import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mariadbPassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.nomeProjeto,
      serviceName: input.nomeServico,
      env: [
        `TIMEZONE=America/Sao_Paulo`,
        `GLPI_LANG="pt_BR"`,
        `MARIADB_HOST=$(PROJECT_NAME)_${input.nomeServicoBanco}`,
        `MARIADB_PORT=3306`,
        `MARIADB_USER=mariadb`,
        `MARIADB_PASSWORD=${mariadbPassword}`,
        `MARIADB_DATABASE=$(PROJECT_NAME)`,
      ].join("\n"),
      source: { type: "image", image: input.nomeImagemDocker },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "bind",
          hostPath: "/opt/glpi/files/",
          mountPath: "/var/lib/glpi/",
        },
        {
          type: "bind",
          hostPath: "/opt/glpi/etc/",
          mountPath: "/etc/glpi/",
        },
        {
          type: "bind",
          hostPath: "/opt/glpi/php-conf/",
          mountPath: "/usr/local/etc/php/conf.d/",
        },
      ],
    },
  });

  services.push({
    type: "mariadb",
    data: {
      projectName: input.nomeProjeto,
      serviceName: input.nomeServicoBanco,
      password: mariadbPassword,
    },
  });

  return { services };
}
