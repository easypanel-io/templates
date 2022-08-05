import { createTemplate, Services } from "~templates-utils";

export default createTemplate({
  name: "Duplicati",
  meta: {
    description:
      "Duplicati is a free, open source, backup client that securely stores encrypted, incremental, compressed backups on cloud storage services and remote file servers. It works with: Amazon S3, OneDrive, Google Drive, Rackspace Cloud Files, HubiC, Backblaze (B2), Amazon Cloud Drive (AmzCD), Swift / OpenStack, WebDAV, SSH (SFTP), FTP, and more!",
    changeLog: [{ date: "2022-08-05", description: "first release" }],
    links: [
      { label: "Website", url: "https://www.duplicati.com/" },
      {
        label: "Documentation",
        url: "https://duplicati.readthedocs.io/en/latest/",
      },
      { label: "Github", url: "https://github.com/duplicati/duplicati" },
    ],
    contributors: [
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
        default: "duplicati",
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
          image: "linuxserver/duplicati",
        },
        proxy: {
          port: 8200,
          secure: true,
        },
        domains: [{ name: domain }],
        env: "TZ=Europe/London",
        mounts: [
          {
            type: "bind",
            hostPath: "/",
            mountPath: "/host",
          },
          {
            type: "volume",
            name: "config",
            mountPath: "/config",
          },
        ],
      },
    });

    return { services };
  },
});
