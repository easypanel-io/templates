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
      proxy: {
        port: 8123,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: "event-data",
          mountPath: "/var/lib/clickhouse",
        },
        {
          type: "file",
          content: [
            "<yandex>",
            "<profiles>",
            "<default>",
            "<log_queries>0</log_queries>",
            "<log_query_threads>0</log_query_threads>",
            "</default>",
            "</profiles>",
            "</yandex>",
            "",
          ].join("\n"),
          mountPath: "/etc/clickhouse-server/users.d/logging.xml",
        },
        {
          type: "file",
          content: [
            "<yandex>",
            "<listen_host>0.0.0.0</listen_host>",
            "",
            "<logger>",
            "<level>warning</level>",
            "<console>true</console>",
            "</logger>",
            "",
            "</yandex>",
            "",
          ].join("\n"),
          mountPath: "/etc/clickhouse-server/config.d/logging.xml",
        },
      ],
    },
  });

  return { services };
}
