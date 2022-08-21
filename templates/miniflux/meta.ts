// Generated using "yarn build-templates"

export const meta = {
  name: "Miniflux",
  description:
    "Miniflux is a minimalist and opinionated feed reader written in GO.Supports multiple enclosures/attachments (Podcasts, videos, music, and images).Save articles to third-party services.Play videos from YouTube channels directly inside Miniflux.Send articles to Telegram, Pinboard, Instapaper, Pocket, Wallabag, Linkding, Espial, or Nunux Keeper",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://miniflux.app/" },
    { label: "Documentation", url: "https://miniflux.app/docs/" },
    { label: "Github", url: "https://github.com/miniflux" },
  ],
  contributors: [
    { name: "Ponky", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "adminUsername",
      "adminPassword",
      "appServiceName",
      "databaseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      adminUsername: { type: "string", title: "Admin Username" },
      adminPassword: { type: "string", title: "Admin Password" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "miniflux",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "db",
      },
    },
  },
};

export type ProjectName = string;
export type Domain = string;
export type AdminUsername = string;
export type AdminPassword = string;
export type AppServiceName = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  adminUsername: AdminUsername;
  adminPassword: AdminPassword;
  appServiceName: AppServiceName;
  databaseServiceName: DatabaseServiceName;
}
