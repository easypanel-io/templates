import {
  AppService,
  createTemplate,
} from "~templates-utils";

export default createTemplate({
  name: "Heimdall",
  meta: {
    description:
      "Heimdall Application Dashboard is a dashboard for all your web applications. It doesn't need to be limited to applications though, you can add links to anything you like. There are no iframes here, no apps within apps, no abstraction of APIs. if you think something should work a certain way, it probably does.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://heimdall.site/" },
      { label: "Documentation", url: "https://heimdall.site/" },
      { label: "Github", url: "https://github.com/linuxserver/Heimdall" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" }
    ],
  },
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
