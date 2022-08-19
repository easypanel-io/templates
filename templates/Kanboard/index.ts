import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Kanboard",
  meta: {
    description:
      "Kanboard is project management software that focuses on the Kanban methodology. There is no fancy user interface, Kanboard focuses on simplicity and minimalism. The number of features is voluntarily limited.",
    changeLog: [{ date: "2022-08-16", description: "first release" }],
    links: [
      { label: "Website", url: "https://kanboard.org/" },
      { label: "Documentation", url: "https://docs.kanboard.org/en/latest/" },
      { label: "Github", url: "https://github.com/kanboard/kanboard" },
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
        default: "kanboard",
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
        source: { type: "image", image: "kanboard/kanboard:latest" },
        mounts: [
          {
            type: "volume",
            name: "data",
            mountPath: "/var/www/app/data",
          },
          {
            type: "volume",
            name: "plugins",
            mountPath: "/var/www/app/plugins",
          },
          {
            type: "volume",
            name: "ssl",
            mountPath: "/etc/nginx/ssl",
          },
        ],
        domains: [{ name: domain }],
        proxy: { port: 80 },
      },
    });

    return { services };
  },
});
