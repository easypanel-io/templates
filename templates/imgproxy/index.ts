import { createTemplate, randomString, Services } from "~templates-utils";

export default createTemplate({
  name: "imgproxy",
  meta: {
    description:
      "imgproxy is a fast and secure standalone server for resizing and converting remote images. imgproxy resizes and processes images on the fly and doesn’t consume disk space",
    instructions:
      "To generate a image URL you can use the following link: https://progapandist.github.io/imgproxy-form/#. Your Salt and Key can be found in the environment variables once you create the service. You can also find more environment variables here: https://docs.imgproxy.net/configuration",
    changeLog: [{ date: "2022-08-05", description: "first release" }],
    links: [
      { label: "Website", url: "https://imgproxy.net/" },
      {
        label: "Documentation",
        url: "https://docs.imgproxy.net/",
      },
      { label: "Github", url: "https://www.github.com/imgproxy/imgproxy" },
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
        default: "imgproxy",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
    },
  } as const,
  generate({
    projectName,
    serviceName,
    domain,
    salt = randomString(18),
    key = randomString(18),
  }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        env: [`IMGPROXY_KEY=${salt}`, `IMGPROXY_SALT=${key}`].join("\n"),
        source: {
          type: "image",
          image: "darthsim/imgproxy",
        },
        proxy: {
          port: 8080,
          secure: true,
        },
        domains: [{ name: domain }],
      },
    });

    return { services };
  },
});
