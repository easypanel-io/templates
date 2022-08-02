import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Flame",
  meta: {
    description:
      "Flame is self-hosted startpage for your server. Its design is inspired (heavily) by SUI. Flame is very easy to setup and use. With built-in editors, it allows you to setup your very own application hub in no time - no file editing necessary",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://github.com/pawelmalak/flame" },
      { label: "Documentation", url: "https://github.com/pawelmalak/flame" },
      { label: "Github", url: "https://github.com/pawelmalak/flame" },
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
        default: "flame",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      password: {
        type: "string",
        title: "Password",
      },
    },
  } as const,
  generate({ projectName, serviceName, domain, password }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "pawelmalak/flame",
        },
        env: `PASSWORD=${password}`,
        proxy: {
          port: 5005,
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
