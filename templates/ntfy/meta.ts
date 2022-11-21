// Generated using "yarn build-templates"

export const meta = {
  name: "Ntfy",
  description:
    "ntfy lets you send push notifications to your phone or desktop via scripts from any computer, using simple HTTP PUT or POST requests.",
  instructions: null,
  changeLog: [{ date: "2022-11-21", description: "first release" }],
  links: [
    { label: "Documentation", url: "https://docs.ntfy.sh" },
    { label: "Github", url: "https://github.com/binwiederhier/ntfy" },
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
        default: "ntfy",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "binwiederhier/ntfy:v1.29.1",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
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
