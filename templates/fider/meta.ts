// Generated using "yarn build-templates"

export const meta = {
  name: "Fider",
  description:
    "Fider is a feedback portal that helps teams collect and prioritize customer feedback in one place, based on votes and ideas submitted.",
  instructions: "Fider REQUIRES email in order for installation to work!",
  changeLog: [{ date: "2022-11-19", description: "first release" }],
  links: [
    { label: "Website", url: "https://fider.io" },
    { label: "Documentation", url: "https://fider.io/docs" },
    { label: "Github", url: "https://github.com/getfider/fider" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "appServiceImage",
      "emailNoReply",
      "emailHost",
      "emailPort",
      "emailUsername",
      "emailPassword",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "fider",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "getfider/fider:stable",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "fider-db",
      },
      emailNoReply: { type: "string", title: "No Reply Email" },
      emailHost: { type: "string", title: "Email Host" },
      emailPort: { type: "number", title: "Email Port", default: 587 },
      emailUsername: { type: "string", title: "Email Username" },
      emailPassword: { type: "string", title: "Email Password" },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;
export type NoReplyEmail = string;
export type EmailHost = string;
export type EmailPort = number;
export type EmailUsername = string;
export type EmailPassword = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
  emailNoReply: NoReplyEmail;
  emailHost: EmailHost;
  emailPort: EmailPort;
  emailUsername: EmailUsername;
  emailPassword: EmailPassword;
}
