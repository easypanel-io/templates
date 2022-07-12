import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "n8n",
  meta: {
    description:
      "Build complex workflows, really fast",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://n8n.io/" },
      { label: "Documentation", url: "https://docs.n8n.io/" },
      { label: "Github", url: "https://github.com/n8n-io/n8n" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" }
    ],
  },
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
