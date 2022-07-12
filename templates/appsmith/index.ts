import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Appsmith",
  meta: {
    description:
      "Appsmith is the open-source framework that lets your team build custom internal applications like dashboards, admin panels, CRUD apps faster, and together",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://www.appsmith.com/" },
      { label: "Documentation", url: "https://docs.appsmith.com/" },
      { label: "Github", url: "https://github.com/appsmithorg/appsmith" },
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
