import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const secret = randomString(64);
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `BASE_URL=https://${input.domain}`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}`,
        `CLICKHOUSE_DATABASE_URL=http://${input.projectName}_${input.clickhouseServiceName}:8123/default`,
        `SECRET_KEY_BASE=${secret}`,


      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 80,
        secure: true,
      },
      deploy: {
          command: "sleep 10 && /entrypoint.sh db createdb && /entrypoint.sh db migrate && /entrypoint.sh db init-admin && /entrypoint.sh run",
      },
          domains: [
        {
          name: input.domain,
        },
      ],
    },
  });
  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.clickhouseServiceName,
      source: {
        type: "image",
        image: "clickhouse/clickhouse-server:22.6-alpine",
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
        // pay attention to this - this is how to add additional file content ( works for any template )
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

    services.push({
      type: "postgres",
      data: {
        image: "postgres:14",
        projectName: input.projectName,
        serviceName: input.databaseServiceName,
        password: databasePassword,
      },
    });

  return { services };
}
