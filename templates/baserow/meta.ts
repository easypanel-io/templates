// Generated using "yarn build-templates"

export const meta = {
  name: "Baserow",
  description:
    "Open source no-code database and Airtable alternative. Create your own online database without technical experience. Our user friendly no-code tool gives you the powers of a developer without leaving your browser.",
  instructions: "It may take several minutes for Baserow to boot up.",
  changeLog: [{ date: "2022-10-05", description: "first release" }],
  links: [
    { label: "Website", url: "https://baserow.io/" },
    { label: "Gitlab", url: "https://gitlab.com/bramw/baserow" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: ["projectName", "domain", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      domain: { type: "string", title: "Domain" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "baserow",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "baserow/baserow:1.14.0",
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
