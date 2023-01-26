// Generated using "yarn build-templates"

export const meta = {
  name: "Mattermost",
  description:
    "Open source platform for developer collaboration. Secure, flexible, and integrated with the tools you love.",
  instructions: null,
  changeLog: [
    { date: "2022-07-12", description: "first release" },
    {
      date: "2022-10-12",
      description: "ablity to define custom docker image version",
    },
    { date: "2022-11-29", description: "Update mattermost to 7.5.1" },
    { date: "2023-1-26", description: "Update mattermost to 7.7" },
  ],
  links: [
    { label: "Website", url: "https://mattermost.com/" },
    { label: "Github", url: "https://github.com/mattermost/" },
  ],
  contributors: [
    { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    { name: "Peter Fodor", url: "https://github.com/fodurrr" },
    { name: "Supernova3339", url: "https://github.com/supernova3339" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "appServiceImage",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "mattermost",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "mattermost/mattermost-team-edition:release-7.7",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "mattermost-db",
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
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
