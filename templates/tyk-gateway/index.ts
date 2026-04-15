import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const gwSecret = randomString(32);
  const redisPassword = randomPassword();
  const redisHost = `$(PROJECT_NAME)_${input.appServiceName}-redis`;

  const tykConf = JSON.stringify(
    {
      log_level: "info",
      listen_port: 8080,
      secret: gwSecret,
      template_path: "/opt/tyk-gateway/templates",
      tyk_js_path: "/opt/tyk-gateway/js/tyk.js",
      middleware_path: "/opt/tyk-gateway/middleware",
      use_db_app_configs: false,
      app_path: "/opt/tyk-gateway/apps/",
      storage: {
        type: "redis",
        host: redisHost,
        port: 6379,
        username: "default",
        password: redisPassword,
        database: 0,
        optimisation_max_idle: 2000,
        optimisation_max_active: 4000,
      },
      enable_analytics: false,
      analytics_config: { type: "", ignored_ips: [] },
      health_check: {
        enable_health_checks: false,
        health_check_value_timeouts: 60,
      },
      enable_non_transactional_rate_limiter: true,
      enable_sentinel_rate_limiter: false,
      enable_redis_rolling_limiter: false,
      allow_master_keys: false,
      policies: {
        policy_source: "file",
        policy_path: "/opt/tyk-gateway/policies",
      },
      hash_keys: true,
      close_connections: false,
      http_server_options: { enable_websockets: true },
      allow_insecure_configs: true,
      coprocess_options: { enable_coprocess: true, coprocess_grpc_server: "" },
      enable_bundle_downloader: true,
      bundle_base_url: "",
      global_session_lifetime: 100,
      force_global_session_lifetime: false,
      max_idle_connections_per_host: 500,
      enable_jsvm: true,
    },
    null,
    2
  );

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.gatewayImage,
      },
      env: `TYK_GW_SECRET=${gwSecret}`,
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8080,
        },
      ],
      mounts: [
        {
          type: "file",
          content: tykConf,
          mountPath: "/opt/tyk-gateway/tyk.conf",
        },
        {
          type: "volume",
          name: "apps",
          mountPath: "/opt/tyk-gateway/apps",
        },
        {
          type: "volume",
          name: "middleware",
          mountPath: "/opt/tyk-gateway/middleware",
        },
        {
          type: "volume",
          name: "certs",
          mountPath: "/opt/tyk-gateway/certs",
        },
        {
          type: "volume",
          name: "policies",
          mountPath: "/opt/tyk-gateway/policies",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: `${input.appServiceName}-redis`,
      password: redisPassword,
      image: input.redisImage,
    },
  });

  return { services };
}
