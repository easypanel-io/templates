import { Output, Services, randomPassword } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const password = randomPassword();

  const config = [
    "persistence_location /mosquitto/data/",
    "plugin /usr/lib/mosquitto_persist_sqlite.so",
    "log_dest stdout",
    "log_timestamp_format %Y-%m-%dT%H:%M:%S",
    "allow_anonymous false",
    "password_file /mosquitto/config/passwd",
    "",
    "listener 1883",
    "protocol mqtt",
    "",
    "listener 9001",
    "protocol websockets",
  ].join("\n");

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `MOSQUITTO_USERNAME=${input.username}`,
        `MOSQUITTO_PASSWORD=${password}`,
      ].join("\n"),
      deploy: {
        command: [
          'mosquitto_passwd -c -b /mosquitto/config/passwd "$MOSQUITTO_USERNAME" "$MOSQUITTO_PASSWORD"',
          "chown mosquitto:mosquitto /mosquitto/config/passwd",
          "chmod 0700 /mosquitto/config/passwd",
          "chown -R mosquitto:mosquitto /mosquitto/data",
          "exec mosquitto -c /mosquitto/config/mosquitto.conf",
        ].join(" && "),
        zeroDowntime: false,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 9001,
        },
      ],
      ports: [
        {
          published: Number(input.mqttPort),
          target: 1883,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "file",
          content: config,
          mountPath: "/mosquitto/config/mosquitto.conf",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/mosquitto/data",
        },
      ],
    },
  });

  return { services };
}
