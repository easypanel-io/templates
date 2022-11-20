// Generated using "yarn build-templates"

export const meta = {
  name: "Vaultwarden",
  description:
    "Unofficial Bitwarden compatible server written in Rust, formerly known as bitwarden_rs",
  instructions:
    'To access the administration interface, please go to /admin on your installation url. The admin token is in your "Environment" tab.',
  changeLog: [{ date: "2022-11-19", description: "first release" }],
  links: [
    {
      label: "Documentation",
      url: "https://github.com/dani-garcia/vaultwarden/wiki",
    },
    { label: "Github", url: "https://github.com/dani-garcia/vaultwarden" },
    {
      label: "Enviroment Variables",
      url: "https://github.com/dani-garcia/vaultwarden/blob/main/.env.template",
    },
  ],
  contributors: [
    { name: "Supernova3339", url: "https://github.com/Supernova3339" },
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
        default: "vaultwarden",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "vaultwarden/server:latest",
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

export interface Input {
  projectName: ProjectName;
  domain: Domain;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
