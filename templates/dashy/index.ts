import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Dashy",
  meta: {
    description:
      "Dashy helps you organize your self-hosted services by making them accessible from a single place",
    instructions:
      "After deploying the project, it may take a while before the app is available (5 minutes).",
    changeLog: [{ date: "2022-08-18", description: "first release" }],
    links: [
      { label: "Website", url: "https://dashy.to/" },
      { label: "Documentation", url: "https://dashy.to/docs/" },
      { label: "Github", url: "https://github.com/lissy93/dashy" },
    ],
    contributors: [
      { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
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
        default: "dashy",
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
        serviceName,
        source: { type: "image", image: "lissy93/dashy" },
        domains: [{ name: domain }],
        proxy: { port: 80 },
        env: `NODE_ENV=production`,
      },
    });

    return { services };
  },
});
