import { Output, Services, randomPassword, randomString } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const mqttPassword = randomPassword();
  const jwtSecret = randomString(32);
  const apiKey = randomString(32);
  const authSecret = randomString(32);

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: { type: "image", image: input.appServiceImage },
      env: [
        `MQTT_BROKER=localhost`,
        `MQTT_PORT=1900`,
        `MQTT_USERNAME=bunker`,
        `MQTT_PASSWORD=${mqttPassword}`,
        `JWT_SECRET=${jwtSecret}`,
        `API_KEY=${apiKey}`,
        `AUTH_SECRET=${authSecret}`,
        `COOKIE_SECURE=true`,
        `FRONTEND_URL=https://$(PRIMARY_DOMAIN)`,
        `ALLOWED_ORIGINS=https://$(PRIMARY_DOMAIN)`,
        `ALLOWED_HOSTS=*`,
        `RATE_LIMIT_PER_MINUTE=100`,
        `LOG_LEVEL=INFO`,
        `API_LOG_FILE=/var/log/api/api_activity.log`,
        `BROKER_LOG_PATH=/var/log/mosquitto/mosquitto.log`,
        `CLIENT_LOG_PATH=/var/log/api/api_activity.log`,
        `DYNSEC_PATH=/var/lib/mosquitto/dynamic-security.json`,
        `MAX_UPLOAD_SIZE=10485760`,
      ].join("\n"),
      ports: [{ published: 1900, target: 1900, protocol: "tcp" }],
      mounts: [
        { type: "volume", name: "next-data", mountPath: "/nextjs/data" },
        { type: "volume", name: "mosquitto-data", mountPath: "/var/lib/mosquitto" },
        { type: "volume", name: "history-data", mountPath: "/var/lib/history" },
      ],
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 2000 }],
    },
  });

  return { services };
}
