// Generated using "yarn build-templates"

export const meta = {
  name: "PowerDNS-Admin",
  description: "A PowerDNS web interface with advanced features.",
  instructions: null,
  changeLog: [{ date: "2022-11-28", description: "first release" }],
  links: [
    {
      label: "Github",
      url: "https://github.com/PowerDNS-Admin/PowerDNS-Admin",
    },
    {
      label: "Documentation",
      url: "https://github.com/PowerDNS-Admin/PowerDNS-Admin/wiki",
    },
  ],
  contributors: [{ name: "Migu2k", url: "https://github.com/migu2k" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "powerdns-admin",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ngoduykhanh/powerdns-admin:latest",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
