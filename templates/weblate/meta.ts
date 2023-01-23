// Generated using "yarn build-templates"

export const meta = {
  name: "Weblate",
  description:
    "Weblate is a libre software web-based continuous localization system. Weblate requires 2GB of ram and 2CPUs.",
  instructions:
    "Please use the following credentials to login. changeme@easypanel.io|changeme",
  changeLog: [{ date: "2022-11-23", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://docs.weblate.org/en/latest/index.html",
    },
    { label: "Github", url: "https://github.com/WeblateOrg/weblate" },
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
      "databaseServiceName",
      "redisServiceName",
      "emailNoReply",
      "emailHost",
      "emailUsername",
      "emailPassword",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "weblate",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "weblate/weblate:4.15.1-1",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "weblate-db",
      },
      redisServiceName: {
        type: "string",
        title: "Redis Service Name",
        default: "weblate-redis",
      },
      emailNoReply: { type: "string", title: "No Reply Email" },
      emailHost: { type: "string", title: "Email Host" },
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
export type RedisServiceName = string;
export type NoReplyEmail = string;
export type EmailHost = string;
export type EmailUsername = string;
export type EmailPassword = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
  redisServiceName: RedisServiceName;
  emailNoReply: NoReplyEmail;
  emailHost: EmailHost;
  emailUsername: EmailUsername;
  emailPassword: EmailPassword;
}
