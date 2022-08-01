import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "whiteboard",
  meta: {
    description:
      "Lightweight collaborative Whiteboard / Sketchboard ",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://github.com/cracker0dks/whiteboard" },
      { label: "Documentation", url: "https://github.com/cracker0dks/whiteboard" },
      { label: "Github", url: "https://github.com/cracker0dks/whiteboard" },
    ],
    contributors: [
      { name: "Ivan Ryan", url: "https://github.com/ivanonpc-22" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta"},
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
        default: "whiteboard",
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
          image: "rofl256/whiteboard",
        },
        proxy: {
          port: 8080,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "data",
            target: "/app",
          },
        ],
      },
    });

    return { services };
  },
});
