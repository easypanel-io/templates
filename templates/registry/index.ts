import { AppService, createTemplate } from "~templates-utils";

export default createTemplate({
  name: "Docker Registry",
  meta: {
    description:
      "The Docker Registry 2.0 implementation for storing and distributing Docker images. This image contains an implementation of the Docker Registry HTTP API V2 for use with Docker 1.6+",
    changeLog: [{ date: "2022-07-26", description: "first release" }],
    links: [
      {
        label: "Documentation",
        url: "https://hub.docker.com/_/registry?tab=description",
      },
    ],
    contributors: [
      { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "Docker Registry",
      },
    },
  } as const,
  generate({ projectName, domain, appServiceName }) {
    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      source: {
        type: "image",
        image: "registry",
      },
      proxy: {
        port: 5000,
        secure: true,
      },
      domains: [{ name: domain }],
      volumes: [
        {
          type: "volume",
          source: "data",
          target: "/var/lib/registry",
        },
      ],
    };

    return {
      services: [{ type: "app", data: appService }],
    };
  },
});
