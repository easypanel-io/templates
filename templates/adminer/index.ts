import {
  Services,
  createTemplate,
} from "~templates-utils";

export default createTemplate({
  name: "Adminer",
  schema: {
    type: "object",
    required: [
      "projectName",
      "serviceName",
      "domain"
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "adminer",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
    },
  } as const,
  generate({
    projectName,
    serviceName,
    domain
  }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "adminer",
        },
        proxy: {
          port: 8080,
          secure: true,
        },
        domains: [{ name: domain }],
      }
    });

    return { services };
  },
});
