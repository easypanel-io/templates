import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const omnibusConfig = [
    `external_url 'http://$(EASYPANEL_DOMAIN)'`,
    `gitlab_rails['gitlab_shell_ssh_port'] = 22`,
  ].join("; ");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `GITLAB_OMNIBUS_CONFIG=${omnibusConfig}`,
        `GITLAB_ROOT_PASSWORD=${input.rootPassword}`,
      ].join("\n"),
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "config",
          mountPath: "/etc/gitlab",
        },
        {
          type: "volume",
          name: "logs",
          mountPath: "/var/log/gitlab",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/var/opt/gitlab",
        },
      ],
    },
  });

  return { services };
}
