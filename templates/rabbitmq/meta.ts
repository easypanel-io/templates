// Generated using "yarn build-templates"

export const meta = {
  name: "RabbitMQ",
  description: "RabbitMQ is an open source multi-protocol messaging broker.",
  instructions:
    "Default user/pass is guest/guest (if you use the -management version of the image)",
  changeLog: [{ date: "2022-11-08", description: "first release" }],
  links: [
    { label: "Website", url: "https://www.rabbitmq.com/" },
    {
      label: "Documentation",
      url: "https://www.rabbitmq.com/documentation.html",
    },
    { label: "Github", url: "https://github.com/rabbitmq/rabbitmq-server/" },
  ],
  contributors: [{ name: "Rubén Robles", url: "https://github.com/D8vjork" }],
  schema: {
    type: "object",
    required: [
      "projectName",
      "appServiceName",
      "appServiceImage",
      "totalMemory",
    ],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "rabbitmq",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "rabbitmq:3",
      },
      enableManagementUI: {
        type: "boolean",
        title: "Enable RabbitMQ Management UI Plugin (modifies image)",
      },
      defaultUserName: { type: "string", title: "Default User Name" },
      defaultUserPassword: { type: "string", title: "Default User Password" },
      totalMemory: {
        type: "string",
        title: "RAM Memory Limit (recommended)",
        default: "512MB",
      },
    },
  },
  logo: "logo.svg",
  screenshots: ["screenshot.jpg"],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type EnableRabbitMQManagementUIPluginModifiesImage = boolean;
export type DefaultUserName = string;
export type DefaultUserPassword = string;
export type RAMMemoryLimitRecommended = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  enableManagementUI?: EnableRabbitMQManagementUIPluginModifiesImage;
  defaultUserName?: DefaultUserName;
  defaultUserPassword?: DefaultUserPassword;
  totalMemory: RAMMemoryLimitRecommended;
}
