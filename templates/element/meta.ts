// Generated using "yarn build-templates"

export const meta = {
  name: "Element",
  description:
    "Element (formerly known as Vector and Riot) is a Matrix web client built using the Matrix React SDK.",
  instructions: null,
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    { label: "Website", url: "https://element.io/" },
    {
      label: "Documentation",
      url: "https://github.com/vector-im/element-web/wiki",
    },
    { label: "Github", url: "https://github.com/vector-im/element-web" },
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
        default: "element",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "vectorim/element-web:v1.11.12",
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
