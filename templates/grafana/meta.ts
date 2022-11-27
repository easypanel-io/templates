// Generated using "yarn build-templates"

export const meta = {
  name: "Grafana",
  description:
    "Grafana is a data visualization and monitoring tool that integrates with a variety of data sources, including InfluxDB, Graphite, Elasticsearch, and Prometheus. It enables you to create custom dashboards to visualize data from these data sources, and to set up alerts based on certain conditions.",
  instructions: null,
  changeLog: [{ date: "2022-11-27", description: "first release" }],
  links: [
    { label: "Website", url: "https://grafana.com/" },
    { label: "Documentation", url: "https://grafana.com/docs/?plcmt=footer" },
    { label: "Github", url: "https://github.com/grafana/" },
  ],
  contributors: [{ name: "Migu2k", url: "https://github.com/migu2k" }],
  schema: {
    type: "object",
    required: ["projectName", "appServiceName", "appServiceImage"],
    properties: {
      projectName: { type: "string", title: "Project Name" },
      appServiceName: {
        type: "string",
        title: "App Service Name",
        default: "grafana",
      },
      appServiceImage: {
        type: "string",
        title: "App Service Image",
        default: "grafana/grafana-oss:8.2.6",
      },
      serviceTimezone: {
        type: "string",
        title: "Timezone",
        default: "Europe/London",
      },
    },
  },
  logo: null,
  screenshots: [],
};

export type ProjectName = string;
export type AppServiceName = string;
export type AppServiceImage = string;
export type Timezone = string;

export interface Input {
  projectName: ProjectName;
  appServiceName: AppServiceName;
  appServiceImage: AppServiceImage;
  serviceTimezone?: Timezone;
}
