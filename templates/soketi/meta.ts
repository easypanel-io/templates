// Generated using "yarn build-templates"

export const meta = {
  name: "Soketi",
  description:
    "Just another simple, fast, and resilient open-source WebSockets server.",
  instructions: null,
  changeLog: [{ date: "2022-10-31", description: "first release" }],
  links: [
    { label: "Website", url: "https://soketi.app/" },
    { label: "Documentation", url: "https://docs.soketi.app/" },
    { label: "Github", url: "https://github.com/soketi/soketi/" },
  ],
  contributors: [{ name: "Rubén Robles", url: "https://github.com/D8vjork" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "redisServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "soketi",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "quay.io/soketi/soketi:1.4-16-debian",
      },
      redisServiceName: {
        type: "string",
        title: "Redis Service Name",
        default: "redis",
      },
      defaultAppId: {
        type: "string",
        title: "Soketi Default App ID",
        default: "myapp",
      },
      defaultAppKey: { type: "string", title: "Soketi Default App Key" },
      defaultAppSecret: {
        type: "string",
        title: "Soketi Default App Secret Key",
      },
      enableClientMessages: {
        type: "boolean",
        title: "Enable default app message exchange between clients",
        default: true,
      },
    },
  },
  logo: "logo.png",
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type RedisServiceName = string;
export type SoketiDefaultAppID = string;
export type SoketiDefaultAppKey = string;
export type SoketiDefaultAppSecretKey = string;
export type EnableDefaultAppMessageExchangeBetweenClients = boolean;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  redisServiceName: RedisServiceName;
  defaultAppId?: SoketiDefaultAppID;
  defaultAppKey?: SoketiDefaultAppKey;
  defaultAppSecret?: SoketiDefaultAppSecretKey;
  enableClientMessages?: EnableDefaultAppMessageExchangeBetweenClients;
}
