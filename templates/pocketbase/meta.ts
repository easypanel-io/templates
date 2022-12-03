// Generated using "yarn build-templates"

export const meta = {
  name: "PocketBase",
  description:
    "PocketBase is an open source backend consisting of embedded database (SQLite) with realtime subscriptions, built-in auth management, convenient dashboard UI and simple REST-ish API.",
  instructions: null,
  changeLog: [{ date: "2022-12-03", description: "First Release" }],
  links: [
    { label: "Website", url: "https://pocketbase.io" },
    { label: "Documentation", url: "https://pocketbase.io/docs" },
    { label: "Github", url: "https://github.com/pocketbase/pocketbase" },
  ],
  contributors: [
    { name: "Ponkhy", url: "https://github.com/Ponkhy" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "pocketbase",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "augustodelg/pocketbase:latest",
      },
    },
  },
  logo: "logo.svg",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type Domain = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
