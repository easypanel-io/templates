import {
  createTemplate,
  Services,
} from "~templates-utils";

export default createTemplate({
  name: "MeTube",
  meta: {
    description:
      "MeTube is a Web GUI for youtube-dl (using the yt-dlp fork) with playlist support. Allows you to download videos from YouTube and dozens of other sites. Browser extensions allow right-clicking videos and sending them directly to MeTube. ",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Documentation", url: "https://github.com/alexta69/metube" },
      { label: "Github", url: "https://github.com/alexta69/metube" },
    ],
    contributors: [
      { name: "Ponky", url: "https://github.com/Ponkhy" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" }
    ],
  },
  schema: {
    type: "object",
    required: [
      "projectName",
      "serviceName",
      "domain",
      "downloadPath",
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "App Service Name",
        default: "metube",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      downloadPath: {
        type: "string",
        title: "Downloads Volume Name",
        default: "downloads",
      },
    },
  } as const,
  generate({
    projectName,
    serviceName,
    domain,
    downloadPath,
  }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "alexta69/metube",
        },
        proxy: {
          port: 8081,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: downloadPath,
            target: "/downloads",
          },
        ],
      },
    });

    return { services };
  },
});
