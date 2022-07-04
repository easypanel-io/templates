import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "phpMyAdmin",
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "domain"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "phpmyadmin",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
    },
  } as const,
  generate({ projectName, serviceName, domain }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "phpmyadmin",
        },
        env: "PMA_ARBITRARY=1",
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
      },
    });

    return { services };
  },
});
