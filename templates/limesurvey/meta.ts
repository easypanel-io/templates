// Generated using "yarn build-templates"

export const meta = {
  name: "Limesurvey",
  description: "The most popular FOSS online survey tool on the web.",
  instructions: null,
  changeLog: [{ date: "2023-01-24", description: "first release" }],
  links: [
    { label: "Website", url: "https://limesurvey.org/" },
    { label: "Documentation", url: "https://manual.limesurvey.org" },
    { label: "Github", url: "https://github.com/WordPress/WordPress" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "databaseServiceName",
      "limesurveyUser",
      "limesurveyPass",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "wordpress",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "tiredofit/limesurvey:1.5.10",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "limesurvey-db",
      },
      limesurveyUser: { type: "string", title: "Username" },
      limesurveyPassword: { type: "string", title: "Password" },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;
export type Username = string;
export type Password = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
  limesurveyUser: Username;
  limesurveyPassword?: Password;
}
