import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "UptimeKuma",
  meta: {
    description: "A fancy self-hosted monitoring tool",
    changeLog: [{ date: "2022-08-02", description: "first release" }],
    links: [
      { label: "Website", url: "https://uptime.kuma.pet" },
      {
        label: "Documentation",
        url: "https://github.com/louislam/uptime-kuma/wiki",
      },
      { label: "Github", url: "https://github.com/louislam/uptime-kuma" },
    ],
    contributors: [
      { name: "Ivan Ryan", url: "https://github.com/ivanonpc-22" },
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
        default: "uptimekuma",
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
          image: "louislam/uptime-kuma:1",
        },
        proxy: {
          port: 3001,
          secure: true,
        },
        domains: [{ name: domain }],
      mounts: [
          {
            type: "volume",
            name: "data",
            mountPath: "/app/data",
          },
        ],
      }     
  });

    return { services };
  },
});
