import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "phpMyAdmin",
  meta: {
    description:
      "phpMyAdmin is a free software tool written in PHP, intended to handle the administration of MySQL over the Web. phpMyAdmin supports a wide range of operations on MySQL and MariaDB.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://www.phpmyadmin.net/" },
      { label: "Documentation", url: "https://www.phpmyadmin.net/docs/" },
      { label: "Github", url: "https://github.com/phpmyadmin/phpmyadmin" },
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
        default: "phpmyadmin",
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
          image: "phpmyadmin",
        },
        env: "PMA_ARBITRARY=1",
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
      },
    });

    return { services };
  },
});
