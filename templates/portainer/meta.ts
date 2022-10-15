// Generated using "yarn build-templates"

export const meta = {
  name: "Portainer",
  description:
    "Easily configure, monitor and secure containers in minutes, with support for Docker, Kubernetes, Swarm and Nomad on any cloud, datacenter or device.Portainer allows to manage Docker containers and Swarm orchestration.Reduces the operational complexity associated with multi-cluster management.Bridge the skills gap and facilitate feature discovery and learning with an intuitive UI.",
  instructions: null,
  changeLog: [{ date: "2022-07-12", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.portainer.io/" },
    { label: "Documentation", url: "https://docs.portainer.io/" },
    { label: "Github", url: "https://github.com/portainer/portainer#readme" },
  ],
  contributors: [{ name: "Andrei Canta", url: "https://github.com/deiucanta" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "portainer",
      },
    },
  },
  logo: "logo.svg",
  screenshots: ["screenshot.png"],
};

export type ProjectName = string;
export type AppServiceName = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
}
