import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      env: [
        `BASE_URL=https://${input.domain}`,
        `DATABASE_URL=postgres://postgres:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?sslmode=disable`,
        `RUST_LOG=info`,
        `NUM_WORKERS=1`,
        `DISABLE_SERVER=false`,
        `METRICS_ADDR=false`,
        `KEEP_JOB_DIR=false`,
        `DENO_PATH=/usr/bin/deno`,
        `PYTHON_PATH=/usr/local/bin/python3`,
        ...(input.licenseKey && input.licenseKey != "" ? [`LICENSE_KEY=${input.licenseKey}`] : [])
      ].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      proxy: {
        port: 8000,
        secure: true,
      },
      domains: [
        {
          name: input.domain,
        },
      ],
    },
  });

  services.push({
    type: "postgres",
    data: {
      projectName: input.projectName,
      serviceName: input.databaseServiceName,
      password: databasePassword,
    },
  });

  return { services };
}
