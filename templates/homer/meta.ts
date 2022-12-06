// Generated using "yarn build-templates"

export const meta = {
  name: "Homer",
  description:
    "A dead simple static HOMepage for your servER to keep your services on hand, from a simple yaml configuration file.",
  instructions: null,
  changeLog: [{ date: "2022-12-1", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/bastienwirtz/homer/blob/main/README.md#table-of-contents",
    },
    { label: "Github", url: "https://github.com/bastienwirtz/homer" },
  ],
  contributors: [{ name: "TheH2SO4", url: "https://github.com/TheH2SO4" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "homer",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "b4bz/homer:latest",
      },
    },
  },
  logo: null,
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
