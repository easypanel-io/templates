// Generated using "yarn build-templates"

export const meta = {
  name: "Ploi Roadmap",
  description:
    "Welcome to Roadmap, the open-source software for your roadmapping needs.",
  instructions: null,
  changeLog: [{ date: "2023-1-6", description: "first release" }],
  links: [{ label: "Github", url: "https://github.com/ploi-deploy/roadmap" }],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
    { name: "Mxrcy", url: "https://github.com/DrMxrcy" },
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
        default: "ploi-roadmap",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "jphj/ploi-roadmap:1.33",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "ploi-roadmap-db",
      },
    },
  },
  logo: null,
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
