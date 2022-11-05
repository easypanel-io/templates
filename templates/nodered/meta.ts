// Generated using "yarn build-templates"

export const meta = {
  name: "Node-RED",
  description:
    "Node-RED is a programming tool for wiring together hardware devices, APIs and online services in new and interesting ways.",
  instructions: null,
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    { label: "Website", url: "https://nodered.org/" },
    { label: "Documentation", url: "https://nodered.org/docs/" },
    { label: "Forum", url: "https://discourse.nodered.org/" },
    { label: "Github", url: "https://github.com/node-red" },
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
        default: "nodered",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "nodered/node-red:2.2.3",
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
