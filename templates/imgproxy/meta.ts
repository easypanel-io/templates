// Generated using "yarn build-templates"

export const meta = {
  name: "imgproxy",
  description:
    "imgproxy is a fast and secure standalone server for resizing and converting remote images. imgproxy resizes and processes images on the fly and doesn’t consume disk space",
  instructions:
    "To generate a image URL you can use the following link: https://progapandist.github.io/imgproxy-form/#. Your Salt and Key can be found in the environment variables once you create the service. You can also find more environment variables here: https://docs.imgproxy.net/configuration",
  changeLog: [{ date: "2022-08-05", description: "first release" }],
  links: [
    { label: "Website", url: "https://imgproxy.net/" },
    { label: "Documentation", url: "https://docs.imgproxy.net/" },
    { label: "Github", url: "https://www.github.com/imgproxy/imgproxy" },
  ],
  contributors: [{ name: "Ivan Ryan", url: "https://github.com/ivanonpc-22" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "domain"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "imgproxy",
      },
      domain: { type: "string", title: "Domain" },
    },
  },
  logo: "logo.svg",
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type Domain = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  domain: Domain;
}
