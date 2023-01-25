// Generated using "yarn build-templates"

export const meta = {
  name: "HumHub",
  description:
    "HumHub is an intuitive to use and modular designed open-source software, used primarily as social network, knowledge database, intranet or information and communication platform.",
  instructions: null,
  changeLog: [{ date: "2023-1-22", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.humhub.com" },
    { label: "Documentation", url: "http://docs.humhub.org/" },
    { label: "Github", url: "https://github.com/humhub/humhub/" },
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
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "humhub",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "mriedmann/humhub:1.9.4",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "humhub-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
