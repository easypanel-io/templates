// Generated using "yarn build-templates"

export const meta = {
  name: "Mailhog",
  description: "Mailhog is a web and API based SMTP tool for testing emails",
  instructions: null,
  changeLog: [{ date: "2022-10-31", description: "first release" }],
  links: [{ label: "Github", url: "https://github.com/mailhog/MailHog/" }],
  contributors: [{ name: "Rubén Robles", url: "https://github.com/D8vjork" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "mailhog",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "mailhog/mailhog:latest",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
