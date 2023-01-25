// Generated using "yarn build-templates"

export const meta = {
  name: "Barrage",
  description: "Minimal Deluge WebUI with full mobile support",
  instructions: null,
  changeLog: [{ date: "2023-1-25", description: "first release" }],
  links: [{ label: "Github", url: "https://github.com/maulik9898/barrage" }],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "domain",
      "appServiceImage",
      "delugeUrl",
      "delugePassword",
      "barragePassword",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "barrage",
      },
      domain: { type: "string", title: "Domain" },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "maulik9898/barrage:0.3.0",
      },
      delugeUrl: { type: "string", title: "Deluge URL" },
      delugePassword: { type: "string", title: "Deluge Password" },
      barragePassword: { type: "string", title: "Barrage Password" },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;
export type AppServiceImage = string;
export type DelugeURL = string;
export type DelugePassword = string;
export type BarragePassword = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
  appServiceImage: AppServiceImage;
  delugeUrl: DelugeURL;
  delugePassword: DelugePassword;
  barragePassword: BarragePassword;
}
