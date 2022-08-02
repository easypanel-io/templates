import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Gotify",
  meta: {
    description:
      "Gotify is a simple server for sending and receiving messages.Both Gotify's API and user interface are designed to be as simple as possible.Gotify is written in Go and can be easily compiled for different platforms.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://gotify.net/" },
      { label: "Documentation", url: "https://gotify.net/docs/" },
      { label: "Github", url: "https://github.com/gotify" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "domain", "password"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "App Service Name",
        default: "gotify",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      password: {
        type: "string",
        title: "Password",
      },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/London",
      },
    },
  } as const,
  generate({ projectName, serviceName, domain, password, serviceTimezone }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "gotify/server",
        },
        env: [
          `GOTIFY_DEFAULTUSER_PASS=${password}`,
          `TZ=${serviceTimezone}`,
        ].join("\n"),
        proxy: {
          port: 80,
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
      },
    });

    return { services };
  },
});
