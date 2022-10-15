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
  ],
  links: [
    { label: "Website", url: "https://mattermost.com/" },
    { label: "Github", url: "https://github.com/mattermost/" },
  ],
  contributors: [
    { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
    { name: "Peter Fodor", url: "https://github.com/fodurrr" },
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
        default: "mattermost",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "mattermost/mattermost-team-edition:release-7.4",
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
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
