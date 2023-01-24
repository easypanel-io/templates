// Generated using "yarn build-templates"

export const meta = {
  name: "CodeX Docs",
  description:
    "CodeX Docs is a free docs application. It's based on Editor.js ecosystem which gives all modern opportunities for working with content.",
  instructions:
    "View All Configuation on the Docs site - https://docs.codex.so/configuration",
  changeLog: [{ date: "2023-01-23", description: "First Release" }],
  links: [
    { label: "Website", url: "https://codex.so" },
    { label: "Documentation", url: "https://docs.codex.so" },
    { label: "Github", url: "https://github.com/codex-team/codex.docs" },
  ],
  contributors: [{ name: "DrMxrcy", url: "https://github.com/DrMxrcy" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "codexAuthPassword",
      "appServiceName",
      "appServiceImage",
      "databaseServiceName",
    ],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      codexAuthPassword: {
        type: "string",
        title: "CodeX Auth Password",
      },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "codex",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "ghcr.io/codex-team/codex.docs:v2.1",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "codex-db",
      },
    },
  },
  logo: "logo.svg",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type CodeXAuthPassword = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  codexAuthPassword: CodeXAuthPassword;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  databaseServiceName: DatabaseServiceName;
}
