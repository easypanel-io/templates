import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  let serviceVariables = [
    `MEILI_ENV=${input.meiliEnv}`,
    `MEILI_MASTER_KEY=${input.meiliMasterKey}`,
  ];

  if (input.meiliNoAnalytics) {
    serviceVariables.push('MEILI_NO_ANALYTICS=');
  }
  
  if (input.meiliScheduleSnapshot) {
    serviceVariables.push('MEILI_SCHEDULE_SNAPSHOT=');
    serviceVariables.push(`MEILI_SNAPSHOT_INTERVAL_SEC=${input.meiliSnapshotInterval}`);
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: serviceVariables.join('\n'),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 7700,
        secure: true,
      },
      mounts: [
        {
          type: "volume",
          name: input.dataVolumeName,
          mountPath: "/meili_data",
        },
      ],
    },
  });

  return { services };
}
