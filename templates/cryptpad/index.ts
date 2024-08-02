import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 80 }],
      mounts: [
        { type: "volume", name: "blob", mountPath: "/cryptpad/blob" },
        { type: "volume", name: "block", mountPath: "/cryptpad/block" },
        { type: "volume", name: "customize", mountPath: "/cryptpad/customize" },
        { type: "volume", name: "data", mountPath: "/cryptpad/data" },
        { type: "volume", name: "datastore", mountPath: "/cryptpad/datastore" },
        {
          type: "file",
          content:
            "module.exports = " +
            JSON.stringify(
              {
                httpUnsafeOrigin: "https://$(PRIMARY_DOMAIN)",
                httpSafeOrigin: "https://$(PRIMARY_DOMAIN)",
                httpAddress: "::",
                httpPort: 80,
                httpSafePort: 443,
                //maxWorkers: 4,
                adminKeys: [],
                //inactiveTime: 90,
                //archiveRetentionTime: 15,
                //accountRetentionTime: 365,
                //disableIntegratedEviction: true,
                //maxUploadSize: 20 * 1024 * 1024,
                //premiumUploadSize: 100 * 1024 * 1024,
                filePath: "./datastore/",
                archivePath: "./data/archive",
                pinPath: "./data/pins",
                taskPath: "./data/tasks",
                blockPath: "./block",
                blobPath: "./blob",
                blobStagingPath: "./data/blobstage",
                decreePath: "./data/decrees",
                logPath: "./data/logs",
                logToStdout: false,
                logLevel: "info",
                logFeedback: false,
                verbose: false,
                installMethod: "docker",
              },
              null,
              2
            ),
          mountPath: "/cryptpad/config/config.js",
        },
      ],
    },
  });

  return { services };
}
