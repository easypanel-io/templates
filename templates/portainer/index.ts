import { AppService, createTemplate } from "~templates-utils";

export default createTemplate({
  name: "Portainer",
  meta: {
    description:
      "Easily configure, monitor and secure containers in minutes, with support for Docker, Kubernetes, Swarm and Nomad on any cloud, datacenter or device.Portainer allows to manage Docker containers and Swarm orchestration.Reduces the operational complexity associated with multi-cluster management.Bridge the skills gap and facilitate feature discovery and learning with an intuitive UI.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Website", url: "https://www.portainer.io/" },
      { label: "Documentation", url: "https://docs.portainer.io/" },
      { label: "Github", url: "https://github.com/portainer/portainer#readme" },
    ],
    contributors: [
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
        default: "portainer",
      },
    },
  } as const,
  generate({ projectName, domain, appServiceName }) {
    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      source: {
        type: "image",
        image: "portainer/portainer-ce",
      },
      proxy: {
        port: 9000,
        secure: true,
      },
      domains: [{ name: domain }],
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "volume",
          name: "data",
          mountPath: "/data",
        },
      ],
    };

    return {
      services: [{ type: "app", data: appService }],
    };
  },
});
