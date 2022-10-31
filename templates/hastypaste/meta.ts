// Generated using "yarn build-templates"

export const meta = {
  name: "Hasty Paste",
  description: "A fast and minimal paste bin, written in Python using Quart.",
  instructions: "Hasty Paste takes a minute or two on first launch.",
  changeLog: [{ date: "2022-10-30", description: "first release" }],
  links: [
    { label: "Documentation", url: "ttps://enchantedcode.co.uk/hasty-paste/" },
    { label: "Github", url: "https://github.com/enchant97/hasty-paste" },
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
        default: "hastypaste",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ghcr.io/enchant97/hasty-paste:1.7.0",
      },
      redisServiceName: {
        type: "string",
        title: "Redis Service Name",
        default: "hastypaste-redis",
      },
    },
  },
  logo: null,
  screenshots: [],
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
