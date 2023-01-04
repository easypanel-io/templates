// Generated using "yarn build-templates"

export const meta = {
  name: "Freescout",
  description:
    "FreeScout is the super lightweight and powerful free open source help desk and shared inbox written in PHP (Laravel framework). It is a self hosted clone of HelpScout.",
  instructions: null,
  changeLog: [{ date: "2023-1-4", description: "first release" }],
  links: [
    { label: "Website", url: "https://freescout.net" },
    {
      label: "Documentation",
      url: "https://github.com/freescout-helpdesk/freescout/wiki",
    },
    {
      label: "Github",
      url: "hhttps://github.com/freescout-helpdesk/freescout/",
    },
  ],
  contributors: [
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
        default: "freescout",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "tiredofit/freescout:php8.1-1.16.15",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "freescout-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot1.png", "screenshot2.png", "screenshot3.png"],
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
