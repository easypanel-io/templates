// Generated using "yarn build-templates"

export const meta = {
  name: "Ghost",
  description:
    "Ghost is a powerful app for new-media creators to publish, share, and grow a business around their content. It comes with modern tools to build a website, publish content, send newsletters & offer paid subscriptions to members.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://ghost.org/" },
    { label: "Documentation", url: "https://ghost.org/resources/" },
    { label: "Github", url: "https://github.com/docker-library/ghost" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "databaseServiceName"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "ghost",
      },
      databaseServiceName: {
        type: "string",
        title: "Database Service Name",
        default: "ghost-db",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type DatabaseServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  databaseServiceName: DatabaseServiceName;
}
