// Generated using "yarn build-templates"

export const meta = {
  name: "HedgeDoc",
  description:
    "HedgeDoc (formerly known as CodiMD) is an open-source, web-based, self-hosted, collaborative markdown editor.",
  instructions: null,
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    { label: "Documentation", url: "https://docs.hedgedoc.org/" },
    { label: "Github", url: "https://git.hedgedoc.org/" },
    { label: "Website", url: "https://hedgedoc.org/" },
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
        default: "hedgedoc",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "linuxserver/hedgedoc:1.9.4",
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
