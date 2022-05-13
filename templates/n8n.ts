import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "n8n",
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
        default: "n8n",
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
          image: "n8nio/n8n",
        },
        env: "PMA_ARBITRARY=1",
        proxy: {
          port: 5678,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "data",
            target: "/home/node/.n8n",
          },
        ],
      },
    });

    return { services };
  },
});
