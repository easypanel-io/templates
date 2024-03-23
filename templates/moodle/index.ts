import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: "moodle",
      source: {
        type: "github",
        owner: "ulties",
        repo: "moodle-docker",
        ref: "v4.3.0",
        path: "/",
        autoDeploy: false,
      },
      env: [
        "MOODLE_URL=https://" + input.moodleDomain,
        "MOODLE_SSLPROXY=true",
        "MOODLE_DB_TYPE=mysqli",
        "MOODLE_DB_HOST=" + input.projectName + "_mysql",
        "MOODLE_DB_NAME=" + input.projectName,
        "MOODLE_DB_USER=mysql",
        "MOODLE_DB_PASSWORD=" + databasePassword,
        "MOODLE_DB_PREFIX=mdl_",
      ].join("\n"),
      deploy: {
        replicas: 1,
        command: null,
        zeroDowntime: true,
      },
      domains: [
        {
          host: input.moodleDomain,
          https: true,
          port: 80,
          path: "/",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "moodle_data",
          mountPath: "/var/www/moodledata",
        },
      ],
    },
  });

  services.push({
    type: "mysql",
    data: {
      projectName: input.projectName,
      serviceName: "mysql",
      image: "mysql:8",
      password: databasePassword,
    },
  });

  return { services };
}

/*

*/
