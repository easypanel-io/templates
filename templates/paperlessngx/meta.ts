// Generated using "yarn build-templates"

export const meta = {
  name: "Paperless-ngx",
  description:
    "Paperless-ngx is a document management system that transforms your physical documents into a searchable online archive so you can keep, well, less paper.",
  instructions: "Please use the following credentials to login. admin|password",
  changeLog: [{ date: "2022-10-28", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://paperless-ngx.readthedocs.io/en/latest/",
    },
    { label: "Github", url: "https://github.com/paperless-ngx/paperless-ngx" },
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
      "redisServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "paperlessngx",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "paperlessngx/paperless-ngx:1.11.3",
      },
      redisServiceName: {
        type: "string",
        title: "Redis Service Name",
        default: "paperlessngx-redis",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type RedisServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  redisServiceName: RedisServiceName;
}
