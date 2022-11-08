// Generated using "yarn build-templates"

export const meta = {
  name: "Metabase",
  description:
    "The simplest, fastest way to get business intelligence and analytics to everyone in your company",
  instructions: null,
  changeLog: [{ date: "2022-11-08", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.metabase.com/" },
    { label: "Documentation", url: "https://www.metabase.com/docs/latest/" },
    { label: "Github", url: "https://github.com/metabase/metabase/" },
  ],
  contributors: [{ name: "Rubén Robles", url: "https://github.com/D8vjork" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "metabase",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "metabase/metabase:latest",
      },
      metabaseSiteName: { type: "string", title: "Metabase Site Name (Title)" },
    },
  },
  logo: "logo.svg",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type MetabaseSiteNameTitle = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  metabaseSiteName?: MetabaseSiteNameTitle;
}
