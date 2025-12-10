import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  let serviceVariables = [
    `MEILI_ENV=${input.meiliEnv}`,
    `MEILI_MASTER_KEY=${input.meiliMasterKey}`,
  ];

  if (input.meiliNoAnalytics) {
    serviceVariables.push("MEILI_NO_ANALYTICS=true");
  }

  if (input.meiliScheduleSnapshot) {
    serviceVariables.push("MEILI_SCHEDULE_SNAPSHOT=true");
    serviceVariables.push(
      `MEILI_SNAPSHOT_INTERVAL_SEC=${input.meiliSnapshotInterval}`
    );
  }

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: serviceVariables.join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 7700,
        },
      ],
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
