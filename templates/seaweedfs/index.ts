import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const masterHost = `$(PROJECT_NAME)_${input.appServiceName}-master`;
  const filerHost = `$(PROJECT_NAME)_${input.appServiceName}-filer`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-master`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/entrypoint.sh master -ip=${masterHost} -ip.bind=0.0.0.0`,
      },
      mounts: [
        {
          type: "volume",
          name: "master-data",
          mountPath: "/data",
        },
      ],
      ports: [
        {
          published: 9333,
          target: 9333,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-volume`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/entrypoint.sh volume -ip=$(PROJECT_NAME)_${input.appServiceName}-volume -master="${masterHost}:9333" -ip.bind=0.0.0.0 -port=8080`,
      },
      mounts: [
        {
          type: "volume",
          name: "volume-data",
          mountPath: "/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-filer`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/entrypoint.sh filer -ip=${filerHost} -master="${masterHost}:9333" -ip.bind=0.0.0.0`,
      },
      mounts: [
        {
          type: "volume",
          name: "filer-data",
          mountPath: "/data",
        },
      ],
      ports: [
        {
          published: 8888,
          target: 8888,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-s3`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/entrypoint.sh s3 -filer="${filerHost}:8888" -ip.bind=0.0.0.0`,
      },
      ports: [
        {
          published: 8333,
          target: 8333,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-webdav`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/entrypoint.sh webdav -filer="${filerHost}:8888"`,
      },
      ports: [
        {
          published: 7333,
          target: 7333,
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-admin`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      deploy: {
        command: `/entrypoint.sh admin -master=${masterHost}:9333`,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 23646,
        },
      ],
    },
  });

  return { services };
}
