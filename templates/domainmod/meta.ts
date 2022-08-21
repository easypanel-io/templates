// Generated using "yarn build-templates"

export const meta = {
  name: "DomainMod",
  description:
    "DomainMOD is an open source application written in PHP used to manage your domains and other internet assets in a central location. DomainMOD also includes a Data Warehouse framework that allows you to import your web server data so that you can view, export, and report on your live data. Currently the Data Warehouse only supports servers running WHM/cPanel.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://domainmod.org/" },
    { label: "Documentation", url: "https://domainmod.org/docs/" },
    { label: "Github", url: "https://github.com/domainmod/domainmod/" },
  ],
  contributors: [
    { name: "Mark Topper", url: "https://github.com/marktopper" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: [
      "projectName",
      "domain",
      "appServiceName",
      "databaseServiceName",
      "timezone",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "domainmod",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "domainmod-db",
      },
      timezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/Copenhagen",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type DatabaseServiceName = string;
export type Timezone = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  databaseServiceName: DatabaseServiceName;
  timezone: Timezone;
}
