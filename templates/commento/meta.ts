// Generated using "yarn build-templates"

export const meta = {
  name: "Commento",
  description:
    "Commento is a platform that you can embed in your website to allow your readers to add comments. It's reasonably fast lightweight. Supports markdown, import from Disqus, voting, automated spam detection, moderation tools, sticky comments, thread locking, OAuth login, single sign-on, and email notifications.",
  instructions: null,
  changeLog: [{ date: "2022-12-13", description: "first release" }],
  links: [
    { label: "Website", url: "https://commento.io/" },
    { label: "Documentation", url: "https://commento.io/" },
    { label: "Gitlab", url: "https://gitlab.com/commento/commento" },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
    { name: "Derock", url: "https://github.com/ItzDerock" },
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
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "commento",
      },
      domain: { type: "string", title: "Domain" },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "registry.gitlab.com/commento/commento",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "commento-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot1.png", "screenshot2.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
