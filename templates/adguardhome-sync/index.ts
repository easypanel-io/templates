import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const configContent = `cron: "*/10 * * * *"

origin:
  # url of the origin instance
  url: https://192.168.1.2:3000
  # apiPath: define an api path if other than "/control"
  # insecureSkipVerify: true # disable tls check
  username: username
  password: password

# replica instance (optional, if only one)
replica:
  # url of the replica instance
  url: http://192.168.1.3
  username: username
  password: password

# replicas instances (optional, if more than one)
# replicas:
#   # url of the replica instance
#   - url: http://192.168.1.3
#     username: username
#     password: password
#   - url: http://192.168.1.4
#     username: ${input.apiUsername}
#     password: ${input.apiPassword}

# Configure the sync API server, disabled if api port is 0
api:
  # Port, default 8080
  port: 8080
  # if username and password are defined, basic auth is applied to the sync API
  username: username
  password: password`;

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        "PUID=1000",
        "PGID=1000",
        "TZ=Etc/UTC",
        "CONFIGFILE=/config/adguardhome-sync.yaml",
      ].join("\n"),
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
          type: "file",
          content: configContent,
          mountPath: "/config/adguardhome-sync.yaml",
        },
      ],
    },
  });

  return { services };
}
