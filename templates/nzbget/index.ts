import {
  createTemplate,
  Services,
} from "~templates-utils";

export default createTemplate({
  name: "Nzbget",
  schema: {
    type: "object",
    required: [
      "projectName",
      "serviceName",
      "domain",
      "username",
      "password",
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "App Service Name",
        default: "nzbget",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      username: {
        type: "string",
        title: "Username",
        default: "nzbget",
      },
      password: {
        type: "string",
        title: "Password",
        default: "tegbzn6789",
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
    serviceName,
    domain,
    username,
    password,
    serviceTimezone,
  }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "lscr.io/linuxserver/nzbget:latest",
        },
        env: [
          `NZBGET_USER=${username}`,
          `NZBGET_PASS=${password}`,
          `TZ=${serviceTimezone}`,
        ].join("\n"),
        proxy: {
          port: 6789,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "config",
            target: "/config",
          },
          {
            type: "volume",
            source: "downloads",
            target: "/downloads",
          },
        ],
      },
    });

    return { services };
  },
});
