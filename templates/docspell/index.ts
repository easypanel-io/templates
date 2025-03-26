import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-restserver`,
      env: [
        `DOCSPELL_SERVER_INTERNAL__URL=http://$(PROJECT_NAME)-${input.appServiceName}-restserver:7880`,
        `DOCSPELL_SERVER_ADMIN__ENDPOINT_SECRET=admin123`,
        `DOCSPELL_SERVER_AUTH_SERVER__SECRET=`,
        `DOCSPELL_SERVER_BACKEND_JDBC_PASSWORD=${databasePassword}`,
        `DOCSPELL_SERVER_BACKEND_JDBC_URL=jdbc:postgresql://$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?sslmode=disable&user=postgres&password=${databasePassword}`,
        `DOCSPELL_SERVER_BACKEND_JDBC_USER=postgres`,
        `DOCSPELL_SERVER_BIND_ADDRESS=0.0.0.0`,
        `DOCSPELL_SERVER_FULL__TEXT__SEARCH_ENABLED=true`,
        `DOCSPELL_SERVER_FULL__TEXT__SEARCH_SOLR_URL=http://$(PROJECT_NAME)-${input.appServiceName}-solr:8983/solr/docspell`,
        `DOCSPELL_SERVER_INTEGRATION__ENDPOINT_ENABLED=true`,
        `DOCSPELL_SERVER_INTEGRATION__ENDPOINT_HTTP__HEADER_ENABLED=true`,
        `DOCSPELL_SERVER_INTEGRATION__ENDPOINT_HTTP__HEADER_HEADER__VALUE=integration-password123`,
        `DOCSPELL_SERVER_BACKEND_SIGNUP_MODE=open`,
        `DOCSPELL_SERVER_BACKEND_SIGNUP_NEW__INVITE__PASSWORD=`,
        `DOCSPELL_SERVER_BACKEND_ADDONS_ENABLED=false`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7880,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-joex`,
      env: [
        `TZ=Europe/Berlin`,
        `DOCSPELL_JOEX_APP__ID=joex1`,
        `DOCSPELL_JOEX_PERIODIC__SCHEDULER_NAME=joex1`,
        `DOCSPELL_JOEX_SCHEDULER_NAME=joex1`,
        `DOCSPELL_JOEX_BASE__URL=http://$(PROJECT_NAME)-${input.appServiceName}-joex:7878`,
        `DOCSPELL_JOEX_BIND_ADDRESS=0.0.0.0`,
        `DOCSPELL_JOEX_FULL__TEXT__SEARCH_ENABLED=true`,
        `DOCSPELL_JOEX_FULL__TEXT__SEARCH_SOLR_URL=http://$(PROJECT_NAME)-${input.appServiceName}-solr:8983/solr/docspell`,
        `DOCSPELL_JOEX_JDBC_PASSWORD=${databasePassword}`,
        `DOCSPELL_JOEX_JDBC_URL=jdbc:postgresql://$(PROJECT_NAME)_${input.appServiceName}-db:5432/$(PROJECT_NAME)?sslmode=disable&user=postgres&password=${databasePassword}`,
        `DOCSPELL_JOEX_JDBC_USER=postgres`,
        `DOCSPELL_JOEX_ADDONS_EXECUTOR__CONFIG_RUNNER=docker,trivial`,
        `DOCSPELL_JOEX_CONVERT_HTML__CONVERTER=weasyprint`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.joexServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-consumedir`,
      env: [
        `DOCSPELL_SERVER=$(PROJECT_NAME)-${input.appServiceName}-restserver`,
      ].join("\n"),
      source: {
        type: "image",
        image: input.consumedirServiceImage,
      },
      deploy: {
        command:
          "dsc -d http://$DOCSPELL_SERVER:7880 watch --delete -ir --not-matches '**/.*' --header 'Docspell-Integration:integration-password123' /opt/docs",
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
          name: "docs",
          mountPath: "/opt/docs",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-solr`,
      source: {
        type: "image",
        image: input.solrServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      serviceName: `${input.appServiceName}-db`,
      password: databasePassword,
    },
  });

  return { services };
}
