// Generated using "yarn build-templates"

export const meta = {
  name: "adguardhome",
  description: "adguard/adguardhome:0.107.16",
  instructions: null,
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
    required: ["projectName", "domain", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "adguardhome",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "adguard/adguardhome:0.107.16",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
