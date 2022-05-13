import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Ghost",
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
        default: "ghost",
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
          image: "ghost",
        },
        env: `url=https://${domain}`,
        proxy: {
          port: 2368,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "content",
            target: "/var/lib/ghost/content",
          },
        ],
      },
    });

    return { services };
  },
});
