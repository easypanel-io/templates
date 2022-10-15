// Generated using "yarn build-templates"

export const meta = {
  name: "Filebrowser",
  description:
    "Filebrowser provides a file managing interface within a specified directory and it can be used to upload, delete, preview, rename and edit your files. It allows the creation of multiple users and each user can have its own directory. It can be used as a standalone app.",
  instructions: 'Default credentials: User:"admin" Password:"admin"',
  changeLog: [{ date: "2022-08-09", description: "first release" }],
  links: [
    { label: "Website", url: "https://filebrowser.org/" },
    { label: "Github", url: "https://github.com/filebrowser/filebrowser" },
  ],
  contributors: [
    { name: "Bedeoan Raul", url: "https://github.com/bedeoan" },
    { name: "Andrei Canta", url: "https://github.com/deiucanta" },
  ],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "filebrowser",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "filebrowser/filebrowser:v2.22.4",
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
