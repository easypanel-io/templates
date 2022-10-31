// Generated using "yarn build-templates"

export const meta = {
  name: "adguardhome",
  description: "Free and open source, powerful network-wide ads & trackers blocking DNS server.v",
  instructions: "In installation wizard, please set the port to 3000"
  changeLog: [{ date: "2022-10-30", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/AdguardTeam/AdGuardHome/wiki",
    },
    { label: "Github", url: "https://github.com/AdguardTeam/AdGuardHome" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "adguardhome",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "adguard/adguardhome:v0.107.16",
      },
    },
  },
  logo: "icon.png",
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
