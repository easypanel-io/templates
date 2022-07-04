import { AppService, createTemplate } from "~templates-utils";

export default createTemplate({
  name: "PsiTransfer",
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
        default: "psitransfer",
      },
    },
  } as const,
  generate({ projectName, domain, appServiceName }) {
    const appService: AppService = {
      projectName,
      serviceName: appServiceName,
      source: {
        type: "image",
        image: "psitrax/psitransfer",
      },
      proxy: {
        port: 3000,
        secure: true,
      },
      domains: [{ name: domain }],
      volumes: [
        {
          type: "volume",
          source: "data",
          target: "/data",
        },
      ],
    };

    return {
      services: [{ type: "app", data: appService }],
    };
  },
});
