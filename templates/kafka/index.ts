import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const numberOfNodes = input.numberOfNodes;
  const replicationFactor = Math.min(input.replicationFactor || 3, numberOfNodes);
  const minIsr = Math.max(1, replicationFactor - 1);

  // Generate controller quorum voters string
  const quorumVoters = Array.from({ length: numberOfNodes }, (_, i) => {
    const nodeId = i + 1;
    const serviceName = `${input.appServiceName}${nodeId}`;
    return `${nodeId}@$(PROJECT_NAME)_${serviceName}:${input.controllerPort}`;
  }).join(",");

  // Generate bootstrap servers string for Kafka UI
  const bootstrapServers = Array.from({ length: numberOfNodes }, (_, i) => {
    const nodeId = i + 1;
    const serviceName = `${input.appServiceName}${nodeId}`;
    return `$(PROJECT_NAME)_${serviceName}:${input.internalBrokerPort}`;
  }).join(",");

  // Create Kafka broker/controller nodes
  for (let i = 0; i < numberOfNodes; i++) {
    const nodeId = i + 1;
    const serviceName = `${input.appServiceName}${nodeId}`;
    const externalPort = input.externalBrokerPortStart + i;

    services.push({
      type: "app",
      data: {
        serviceName: serviceName,
        source: {
          type: "image",
          image: input.appServiceImage,
        },
        env: [
          `KAFKA_NODE_ID=${nodeId}`,
          `KAFKA_PROCESS_ROLES=broker,controller`,
          `KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER`,
          `KAFKA_LISTENERS=INTERNAL://:${input.internalBrokerPort},CONTROLLER://:${input.controllerPort},EXTERNAL://:${externalPort}`,
          `KAFKA_ADVERTISED_LISTENERS=INTERNAL://$(PROJECT_NAME)_${serviceName}:${input.internalBrokerPort},EXTERNAL://localhost:${externalPort}`,
          `KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=INTERNAL:PLAINTEXT,CONTROLLER:PLAINTEXT,EXTERNAL:PLAINTEXT`,
          `KAFKA_INTER_BROKER_LISTENER_NAME=INTERNAL`,
          `KAFKA_CONTROLLER_QUORUM_VOTERS=${quorumVoters}`,
          `CLUSTER_ID=${input.clusterId}`,
          `KAFKA_LOG_DIRS=/var/lib/kafka/data`,
          `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=${replicationFactor}`,
          `KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=${replicationFactor}`,
          `KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=${minIsr}`,
        ].join("\n"),
        ports: [
          {
            published: externalPort,
            target: externalPort,
            protocol: "tcp",
          },
        ],
        mounts: [
          {
            type: "volume",
            name: `${serviceName}_data`,
            mountPath: "/var/lib/kafka/data",
          },
        ],
      },
    });
  }

  // Create Kafka UI if enabled
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
          `KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=${bootstrapServers}`,
        ].join("\n"),
        domains: [
          {
            host: "$(EASYPANEL_DOMAIN)",
            port: 8080,
          },
        ],
      },
    });
  }

  return { services };
}

