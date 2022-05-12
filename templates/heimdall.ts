import {
  AppService,
  createTemplate,
} from "~templates-utils";

export default createTemplate({
  name: "Heimdall",
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "heimdall",
      },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/London",
      },
    },
  } as const,
  generate({
    projectName,
    domain,
    appServiceName,
    serviceTimezone,
  }) {
    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      env: [
        `PUID=1000`,
        `PGID=1000`,
        `TZ=${serviceTimezone}`,
      ].join("\n"),
      source: {
        type: "image",
        image: "lscr.io/linuxserver/heimdall:latest",
      },
      proxy: {
        port: 80,
        secure: true,
      },
      domains: [{ name: domain }],
      volumes: [
        {
          type: "volume",
          source: "config",
          target: "/config",
        },
      ],
    };

    return {
      services: [
        { type: "app", data: appService },
      ],
    };
  },
});
