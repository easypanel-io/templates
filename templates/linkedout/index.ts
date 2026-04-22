import { Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-frontend`,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 3000,
        },
      ],
      env: [
        `NEXT_PUBLIC_POCKETBASE_URL=https://$(PROJECT_NAME)-${input.appServiceName}-pocketbase.$(EASYPANEL_HOST)`,
        `NEXT_PUBLIC_N8N_WEBHOOK_URL=https://$(PROJECT_NAME)-${input.appServiceName}-n8n.$(EASYPANEL_HOST)`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "frontend-data",
          mountPath: "/app/data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-pocketbase`,
      source: {
        type: "image",
        image: input.backendServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8090,
        },
      ],
      env: [
        `PB_ADMIN_EMAIL=${input.pbAdminEmail}`,
        `PB_ADMIN_PASSWORD=${input.pbAdminPassword}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "pb-data",
          mountPath: "/pb_data",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-n8n`,
      source: {
        type: "image",
        image: input.n8nServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 5678,
        },
      ],
      env: [
        "N8N_HOST=0.0.0.0",
        "N8N_PORT=5678",
        "N8N_PROTOCOL=http",
        "N8N_PATH=/",
        "N8N_USER_MANAGEMENT_DISABLED=true",
        "N8N_DIAGNOSTICS_ENABLED=false",
        "N8N_PUBLIC_API_DISABLED=false",
        `WEBHOOK_URL=https://$(PRIMARY_DOMAIN)`,
        "DB_TYPE=sqlite",
        "DB_SQLITE_PATH=/home/node/.n8n/database.sqlite",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "n8n-data",
          mountPath: "/home/node/.n8n",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-ngrok`,
      source: {
        type: "image",
        image: input.ngrokServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 4040,
        },
      ],
      env: [`NGROK_AUTHTOKEN=${input.ngrokAuthToken}`].join("\n"),
      deploy: {
        command: `./entrypoint.sh http $(PROJECT_NAME)_${input.appServiceName}-n8n:5678`,
      },
    },
  });

  return { services };
}
