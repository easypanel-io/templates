import {
  createTemplate,
  Services,
} from "~templates-utils";

export default createTemplate({
  name: "MeTube",
  schema: {
    type: "object",
    required: [
      "projectName",
      "serviceName",
      "domain",
      "downloadPath",
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "App Service Name",
        default: "metube",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      downloadPath: {
        type: "string",
        title: "Download Path",
        default: "downloads",
      },
    },
  } as const,
  generate({
    projectName,
    serviceName,
    domain,
    downloadPath,
  }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "alexta69/metube",
        },
        proxy: {
          port: 8081,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: downloadPath,
            target: "/downloads",
          },
        ],
      },
    });

    return { services };
  },
});
