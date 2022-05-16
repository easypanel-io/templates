import {
  createTemplate,
  Services,
} from "~templates-utils";

export default createTemplate({
  name: "Gotify",
  schema: {
    type: "object",
    required: [
      "projectName",
      "serviceName",
      "domain",
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
        default: "gotify",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      password: {
        type: "string",
        title: "Password",
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
          image: "gotify/server",
        },
        env: [
          `GOTIFY_DEFAULTUSER_PASS=${password}`,
          `TZ=${serviceTimezone}`,
        ].join("\n"),
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "data",
            target: "/app/data",
          },
        ],
      },
    });

    return { services };
  },
});
