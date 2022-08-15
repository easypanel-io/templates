import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Change Detection",
  meta: {
    description:
      "Web Site Change Detection, Monitoring and Notification - Self-Hosted or SaaS.Know when web pages change! Stay ontop of new information! get notifications when important website content changes",
    changeLog: [{ date: "2022-08-15", description: "first release" }],
    links: [
      { label: "Website", url: "https://changedetection.io" },
      {
        label: "Github",
        url: "https://github.com/dgtlmoon/changedetection.io",
      },
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
        default: "Changedetection",
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
        source: { type: "image", image: "ghcr.io/dgtlmoon/changedetection.io" },
        mounts: [
          { type: "volume", name: "datastore", mountPath: "/datastore" },
        ],
        domains: [{ name: "ch.test.rezervari.app" }],
        proxy: { port: 5000, secure: true },
        deploy: { replicas: 1, command: null, zeroDowntime: true },
        env: [``].join("\n"),
      },
    });
    return { services };
  },
});
