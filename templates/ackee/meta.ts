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
  contributors: [{ name: "Ponky", url: "https://github.com/Ponkhy" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "ackeeUsername",
      "ackeePassword",
      "appServiceName",
      "mongoServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      ackeeUsername: { type: "string", title: "Ackee Username" },
      ackeePassword: { type: "string", title: "Ackee Password" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "ackee",
      },
      mongoServiceName: {
        type: "string",
        title: "MongoDB Service Name",
        default: "mongodb",
      },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AckeeUsername = string;
export type AckeePassword = string;
export type AppServiceName = string;
export type MongoDBServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  ackeeUsername: AckeeUsername;
  ackeePassword: AckeePassword;
  appServiceName: AppServiceName;
  mongoServiceName: MongoDBServiceName;
}
