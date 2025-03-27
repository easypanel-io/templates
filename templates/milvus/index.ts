import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        `ETCD_ENDPOINTS=$(PROJECT_NAME)_${input.appServiceName}-etcd:2379`,
        `MINIO_ADDRESS=$(PROJECT_NAME)_${input.appServiceName}-minio:9000`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "milvus_data",
          mountPath: "/var/lib/milvus",
        },
      ],
      deploy: {
        command: "milvus run standalone",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-etcd`,
      source: {
        type: "image",
        image: input.etcdImage,
      },
      env: [
        "ETCD_AUTO_COMPACTION_MODE=revision",
        "ETCD_AUTO_COMPACTION_RETENTION=1000",
        "ETCD_QUOTA_BACKEND_BYTES=4294967296",
      ].join("\n"),
      ports: [
        {
          published: 2379,
          target: 2379,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "etcd_data",
          mountPath: "/etcd",
        },
      ],
      deploy: {
        command:
          "etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-minio`,
      source: {
        type: "image",
        image: input.minioImage,
      },
      env: [
        `MINIO_ACCESS_KEY=${input.minioAccessKey}`,
        `MINIO_SECRET_KEY=${input.minioSecretKey}`,
      ].join("\n"),

      mounts: [
        {
          type: "volume",
          name: "minio_data",
          mountPath: "/minio_data",
        },
      ],
      deploy: {
        command: "minio server /minio_data",
      },
    },
  });

  return { services };
}
