import {
  createTemplate,
  Services,
} from "~templates-utils";

export default createTemplate({
  name: "Nzbget",
  meta: {
    description:
      "NZBGet is a binary downloader, which downloads files from Usenet based on information given in nzb-files.NZBGet is written in C++ and is known for its performance and efficiency.NZBGet can run on almost any device - classic PC, NAS, media player, SAT-receiver, WLAN-router, etc. The download area provides precompiled binaries for Windows, macOS, Linux (compatible with many CPUs and platform variants), FreeBSD and Android.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website",  url: "https://nzbget.net/" },
      { label: "Documentation", url: "https://nzbget.net/documentation" },
      { label: "Github", url: "https://github.com/nzbget/nzbget" },
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
      "username",
      "password",
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "App Service Name",
        default: "nzbget",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      username: {
        type: "string",
        title: "Username",
        default: "nzbget",
      },
      password: {
        type: "string",
        title: "Password",
        default: "tegbzn6789",
      },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/London",
      },
    },
  } as const,
  generate({
    projectName,
    serviceName,
    domain,
    username,
    password,
    serviceTimezone,
  }) {
    const services: Services = [];

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName: serviceName,
        source: {
          type: "image",
          image: "lscr.io/linuxserver/nzbget:latest",
        },
        env: [
          `NZBGET_USER=${username}`,
          `NZBGET_PASS=${password}`,
          `TZ=${serviceTimezone}`,
        ].join("\n"),
        proxy: {
          port: 6789,
          secure: true,
        },
        domains: [{ name: domain }],
        volumes: [
          {
            type: "volume",
            source: "config",
            target: "/config",
          },
          {
            type: "volume",
            source: "downloads",
            target: "/downloads",
          },
        ],
      },
    });

    return { services };
  },
});
