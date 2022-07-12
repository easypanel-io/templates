import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Ghost",
  meta: {
    description:
      "Ghost is a powerful app for new-media creators to publish, share, and grow a business around their content. It comes with modern tools to build a website, publish content, send newsletters & offer paid subscriptions to members.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://ghost.org/" },
      { label: "Documentation", url: "https://ghost.org/resources/" },
      { label: "Github", url: "https://github.com/docker-library/ghost" },
    ],
    contributors: [
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
