import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  const configFileContents = [];
  
  if (input.totalMemory) {
    configFileContents.push(`total_memory_available_override_value=${input.totalMemory}`)
  }
  
  if (input.defaultUserPassword) {
    configFileContents.push(`default_pass=${input.defaultUserPassword}`)
  }

  if (input.defaultUserName) {
    configFileContents.push(`default_user=${input.defaultUserName}`)
  }

  const ports = []

  if (input.enableManagementUI) {
    ports.push({
      published: 5672,
      target: 5672,
    })
  }

  services.push({
    type: "app",
    data: {
      projectName: input.projectName,
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.enableManagementUI ? 'rabbitmq:3-management' : input.appServiceImage,
      },
      proxy: {
        port: input.enableManagementUI ? 15672 : 5672,
        secure: true,
      },
      ports,
      mounts: [
        {
          type: 'file',
          mountPath: '/etc/rabbitmq/rabbitmq.conf',
          content: configFileContents.join('\n')
        }
      ]
    },
  });

  return { services };
}
