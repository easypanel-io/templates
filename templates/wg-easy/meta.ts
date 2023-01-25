// Generated using "yarn build-templates"

export const meta = {
  name: "Wg-easy",
  description:
    "You have found the easiest way to install & manage WireGuard on any Linux host!",
  instructions: null,
  changeLog: [{ date: "2022-12-20", description: "first release" }],
  links: [
    { label: "Website", url: "https://github.com/WeeJeWel/wg-easy" },
    { label: "Documentation", url: "https://github.com/WeeJeWel/wg-easy/wiki" },
    { label: "Github", url: "https://github.com/WeeJeWel/wg-easy" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "appDomain",
      "appPassword",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "wg-easy",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "weejewel/wg-easy:7",
      },
      appDomain: { type: "string", title: "App Domain" },
      appPassword: { type: "string", title: "Admin Password" },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type AppDomain = string;
export type AdminPassword = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  appDomain: AppDomain;
  appPassword: AdminPassword;
}
