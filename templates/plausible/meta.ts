// Generated using "yarn build-templates"

export const meta = {
  name: "Plausible",
  description:
    "Plausible Analytics is an open-source project dedicated to making web analytics more privacy-friendly. Our mission is to reduce corporate surveillance by providing an alternative web analytics tool which does not come from the AdTech world.",
  changeLog: [{ date: "2022-12-13", description: "first release" }],
  links: [
    { label: "Website", url: "https://plausible.io" },
    { label: "Documentation", url: "https://plausible.io/docs" },
    { label: "Github", url: "https://github.com/plausible/plausible" },
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
      "clickhouseServiceName",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "plausible",
      },
      domain: { type: "string", title: "Domain" },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "plausible/analytics:v1.5.1",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "plausible-db",
      },
      clickhouseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "plausible-clickhouse",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;
export type DatabaseServiceName1 = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
  clickhouseServiceName: DatabaseServiceName1;
}
