// Generated using "yarn build-templates"

export const meta = {
  name: "Hastebin",
  description:
    "Hastebin is an open-source pastebin software written in node.js, which is easily installable in any network.",
  instructions: null,
  changeLog: [{ date: "2022-11-22", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/toptal/haste-server/wiki",
    },
    { label: "Github", url: "https://github.com/toptal/haste-server" },
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
        default: "hastebin",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "rlister/hastebin:latest",
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
