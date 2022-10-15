// Generated using "yarn build-templates"

export const meta = {
  name: "Duplicati",
  description:
    "Duplicati is a free, open source, backup client that securely stores encrypted, incremental, compressed backups on cloud storage services and remote file servers. It works with: Amazon S3, OneDrive, Google Drive, Rackspace Cloud Files, HubiC, Backblaze (B2), Amazon Cloud Drive (AmzCD), Swift / OpenStack, WebDAV, SSH (SFTP), FTP, and more!",
  instructions: null,
  changeLog: [{ date: "2022-08-05", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.duplicati.com/" },
    {
      label: "Documentation",
      url: "https://duplicati.readthedocs.io/en/latest/",
    },
    { label: "Github", url: "https://github.com/duplicati/duplicati" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "duplicati",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "lscr.io/linuxserver/duplicati:2.0.6",
      },
    },
  },
  logo: "logo.png",
  screenshots: ["screenshot.jpg"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
}
