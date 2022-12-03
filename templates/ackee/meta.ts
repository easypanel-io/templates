// Generated using "yarn build-templates"

export const meta = {
  name: "Ackee",
  description:
    "Self-hosted, Node.js based analytics tool for those who care about privacy. Ackee runs on your own server, analyzes the traffic of your websites and provides useful statistics in a minimal interface.",
  instructions: null,
  changeLog: [{ date: "2022-06-04", description: "first release" }],
  links: [
    { label: "Website", url: "https://ackee.electerious.com/" },
    { label: "Documentation", url: "https://docs.ackee.electerious.com/" },
    { label: "Github", url: "https://github.com/electerious/Ackee" },
  ],
  contributors: [{ name: "Ponkhy", url: "https://github.com/Ponkhy" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "ackeeUsername",
      "ackeePassword",
      "appServiceName",
      "appServiceImage",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      ackeeUsername: { type: "string", title: "Ackee Username" },
      ackeePassword: { type: "string", title: "Ackee Password" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "ackee",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "electerious/ackee:3.4.1",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "ackee-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AckeeUsername = string;
export type AckeePassword = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  ackeeUsername: AckeeUsername;
  ackeePassword: AckeePassword;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
