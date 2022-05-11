import { AppService, createTemplate } from "~templates-utils";

export default createTemplate({
  name: "Portainer",
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
      volumes: [
        {
          type: "bind",
          source: "/var/run/docker.sock",
          target: "/var/run/docker.sock",
        },
        {
          type: "volume",
          source: "portainer_data",
          target: "/data",
        },
      ],
    };

    return {
      services: [{ type: "app", data: appService }],
    };
  },
});
