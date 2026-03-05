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
      ports: [
        {
          published: 2022,
          target: 2022,
          protocol: "tcp",
        },
        {
          published: 2121,
          target: 2121,
          protocol: "tcp",
        },
        {
          published: 10080,
          target: 10080,
          protocol: "tcp",
        },
      ],
      env: [
        "SFTPGO_HTTPD_BINDINGS_0_PORT=8080",
        "SFTPGO_HTTPD_BINDINGS_0_ADDRESS=0.0.0.0",
        "SFTPGO_DATA_PROVIDER_CREATE_DEFAULT_ADMIN=true",
        "SFTPGO_WEBDAVD_BINDINGS_0_PORT=10080",
        "SFTPGO_FTPD_BINDINGS_0_PORT=2121",
        "SFTPGO_FTPD_BINDINGS_0_FORCE_PASSIVE_IP=127.0.0.1:8080",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "sftpgo-data",
          mountPath: "/srv/sftpgo",
        },
        {
          type: "volume",
          name: "sftpgo-home",
          mountPath: "/var/lib/sftpgo",
        },
      ],
    },
  });

  return { services };
}
