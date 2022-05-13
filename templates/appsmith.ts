import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Appsmith",
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
        default: "appsmith",
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
          image: "appsmith/appsmith-ce",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "stacks",
            target: "/appsmith-stacks",
          },
        ],
      },
    });

    return { services };
  },
});
