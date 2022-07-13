import { AppService, createTemplate } from "~templates-utils";

export default createTemplate({
  name: "PsiTransfer",
  meta: {
    description:
      "Simple open source self-hosted file sharing solution. It's an alternative to paid services like Dropbox, WeTransfer.No accounts, no logins. Mobile friendly responsive interface.",
    changeLog: [{ date: "2022-07-12", description: "first release" }],
    links: [
      { label: "Documentation", url: "https://github.com/psi-4ward/psitransfer/tree/master/docs" },
      { label: "Github", url: "https://github.com/psi-4ward/psitransfer" },
    ],
    contributors: [
      { name: "Mark Topper", url: "https://github.com/marktopper" },
      { name: "Andrei Canta", url: "https://github.com/deiucanta" }
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
