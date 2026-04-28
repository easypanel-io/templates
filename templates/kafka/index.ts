import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const kafkaServiceName = input.appServiceName;

  services.push({
    type: "app",
    data: {
      serviceName: kafkaServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      env: [
        "KAFKA_NODE_ID=1",
        "KAFKA_PROCESS_ROLES=broker,controller",
        "KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER",
        "KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093",
        `KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://$(PROJECT_NAME)_${kafkaServiceName}:9092`,
        "KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT",
        `KAFKA_CONTROLLER_QUORUM_VOTERS=1@$(PROJECT_NAME)_${kafkaServiceName}:${input.controllerPort}`,
        `CLUSTER_ID=${input.clusterId}`,
        "KAFKA_LOG_DIRS=/var/lib/kafka/data",
        "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1",
        "KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1",
        "KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1",
      ].join("\n"),
      ports: [
        {
          published: input.appServicePort,
          target: 9092,
          protocol: "tcp",
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "kafka_data",
          mountPath: "/var/lib/kafka/data",
        },
      ],
    },
  });

  if (input.enableKafkaUI) {
    services.push({
      type: "app",
      data: {
        serviceName: `${input.appServiceName}-ui`,
        source: {
          type: "image",
          image: input.kafkaUIImage,
        },
        env: [
          `KAFKA_CLUSTERS_0_NAME=${input.clusterId}`,
          `KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=$(PROJECT_NAME)_${kafkaServiceName}:9092`,
        ].join("\n"),
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 8080,
          },
        ],
      },
    } as Services[number]);
  }

  return { services };
}
