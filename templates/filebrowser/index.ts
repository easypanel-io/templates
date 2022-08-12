import { createTemplate, Services } from "~templates-utils"

export default createTemplate({
  name: "Filebrowser",
  meta: {
    description:
      "Filebrowser provides a file managing interface within a specified directory and it can be used to upload, delete, preview, rename and edit your files. It allows the creation of multiple users and each user can have its own directory. It can be used as a standalone app.",
    instructions: `Default credentials: User:"admin" Password:"admin"`,
    changeLog: [{ date: "2022-08-09", description: "first release" }],
    links: [
      { label: "Website", url: "https://filebrowser.org/" },
      { label: "Github", url: "https://github.com/filebrowser/filebrowser" },
    ],
    contributors: [
      { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    ],
  },
  schema: {
    type: "object",
    required: ["projectName", "domain", "serviceName"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "filebrowser",
      },
    },
  } as const,
  generate({ projectName, domain, serviceName }) {
    const services: Services = []

    services.push({
      type: "app",
      data: {
        projectName,
        serviceName,
        source: {
          type: "image",
          image: "filebrowser/filebrowser:latest",
        },
        proxy: {
          port: 80,
          secure: true,
        },
        domains: [{ name: domain }],
        mounts: [
          { type: "bind", hostPath: "/", mountPath: "/srv" },
          { type: "volume", name: "database", mountPath: "/database" },
          {
            type: "file",
            content: JSON.stringify(
              {
                port: 80,
                baseURL: "",
                address: "",
                log: "stdout",
                database: "/database/database.db",
                root: "/srv",
              },
              null,
              2
            ),
            mountPath: "/.filebrowser.json",
          },
        ],
        deploy: {
          zeroDowntime: false,
        },
      },
    })

    return { services }
  },
})
