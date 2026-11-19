import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const name = input.appServiceName;
  const apiImage = input.appServiceImage;
  const webImage = input.webServiceImage;
  const agentImageTag = apiImage.split(":")[1] ?? "latest";

  const databasePassword = randomPassword();
  const redisPassword = randomPassword();
  const secretKey = randomString(64);
  const sandboxKey = randomString(32);
  const pluginDaemonKey = randomString(48);
  const pluginInnerKey = randomString(48);
  const weaviateKey = randomString(32);
  const agentToken = randomString(48);
  const agentServerSecret = randomString(43);
  const localSandboxToken = randomString(48);

  const domain = `$(PROJECT_NAME)-${name}.$(EASYPANEL_HOST)`;
  const publicUrl = `https://${domain}`;
  const storageHostPath = `/etc/easypanel/projects/$(PROJECT_NAME)/${name}-storage`;

  const dbHost = `${name}-db`;
  const redisHost = `${name}-redis`;
  const apiUrl = `http://${name}-api:5001`;
  const pluginDaemonUrl = `http://${name}-plugin-daemon:5002`;
  const agentBackendUrl = `http://${name}-agent-backend:5050`;
  const ssrfProxyUrl = `http://${name}-ssrf-proxy:3128`;
  const agentProxyUrl = `http://${name}-agent-ssrf-proxy:3128`;

  const storageMount = {
    type: "bind" as const,
    hostPath: storageHostPath,
    mountPath: "/app/api/storage",
  };

  const backendEnv = [
    "DEPLOY_ENV=PRODUCTION",
    "LOG_LEVEL=INFO",
    `SECRET_KEY=${secretKey}`,
    `FILES_URL=${publicUrl}`,
    `TRIGGER_URL=${publicUrl}`,
    `ENDPOINT_URL_TEMPLATE=${publicUrl}/e/{hook_id}`,
    "RESPECT_XFORWARD_HEADERS_ENABLED=true",
    "CONSOLE_CORS_ALLOW_ORIGINS=*",
    "DB_TYPE=postgresql",
    `DB_HOST=${dbHost}`,
    "DB_PORT=5432",
    "DB_USERNAME=postgres",
    `DB_PASSWORD=${databasePassword}`,
    "DB_DATABASE=dify",
    "SQLALCHEMY_POOL_PRE_PING=true",
    `REDIS_HOST=${redisHost}`,
    "REDIS_PORT=6379",
    `REDIS_PASSWORD=${redisPassword}`,
    "REDIS_DB=0",
    `CELERY_BROKER_URL=redis://:${redisPassword}@${redisHost}:6379/1`,
    "CELERY_BACKEND=redis",
    "STORAGE_TYPE=opendal",
    "OPENDAL_SCHEME=fs",
    "OPENDAL_FS_ROOT=storage",
    "VECTOR_STORE=weaviate",
    `WEAVIATE_ENDPOINT=http://${name}-weaviate:8080`,
    `WEAVIATE_GRPC_ENDPOINT=grpc://${name}-weaviate:50051`,
    `WEAVIATE_API_KEY=${weaviateKey}`,
    `CODE_EXECUTION_ENDPOINT=http://${name}-sandbox:8194`,
    `CODE_EXECUTION_API_KEY=${sandboxKey}`,
    `SSRF_PROXY_HTTP_URL=${ssrfProxyUrl}`,
    `SSRF_PROXY_HTTPS_URL=${ssrfProxyUrl}`,
    `PLUGIN_DAEMON_URL=${pluginDaemonUrl}`,
    `PLUGIN_DAEMON_KEY=${pluginDaemonKey}`,
    `INNER_API_KEY_FOR_PLUGIN=${pluginInnerKey}`,
    "PLUGIN_MAX_PACKAGE_SIZE=52428800",
    "PLUGIN_DAEMON_TIMEOUT=600.0",
    "MARKETPLACE_ENABLED=true",
    "MARKETPLACE_API_URL=https://marketplace.dify.ai",
    `AGENT_BACKEND_BASE_URL=${agentBackendUrl}`,
    `DIFY_AGENT_API_TOKEN=${agentToken}`,
    `AGENT_BACKEND_API_TOKEN=${agentToken}`,
    "NEXT_PUBLIC_ENABLE_AGENT_V2=true",
    "ENABLE_COLLABORATION_MODE=true",
    "SERVER_WORKER_AMOUNT=1",
    "SERVER_WORKER_CLASS=gevent",
    "GUNICORN_TIMEOUT=360",
    "CELERY_WORKER_AMOUNT=4",
  ];

  const nginxConf = `user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    client_max_body_size 100M;
    resolver 127.0.0.11 valid=30s ipv6=off;

    map $http_x_forwarded_proto $dify_forwarded_proto {
        default $http_x_forwarded_proto;
        "" $scheme;
    }

    map $http_upgrade $dify_connection_upgrade {
        default upgrade;
        "" "";
    }

    server {
        listen 80;
        server_name _;

        set $api_upstream ${name}-api:5001;
        set $web_upstream ${name}-web:3000;
        set $socket_upstream ${name}-websocket:5001;
        set $plugin_upstream ${name}-plugin-daemon:5002;

        location /console/api {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /api {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /v1 {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /openapi {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /files {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /mcp {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /triggers {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /callbacks/human-input/v2/im/ {
            proxy_pass http://$api_upstream;
            include proxy.conf;
        }

        location /socket.io/ {
            proxy_pass http://$socket_upstream;
            include proxy.conf;
            proxy_cache_bypass $http_upgrade;
        }

        location /e/ {
            proxy_pass http://$plugin_upstream;
            include proxy.conf;
            proxy_set_header Dify-Hook-Url $dify_forwarded_proto://$host$request_uri;
        }

        location / {
            proxy_pass http://$web_upstream;
            include proxy.conf;
        }
    }
}
`;

  const nginxProxyConf = `proxy_set_header Host $host;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $dify_forwarded_proto;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $dify_connection_upgrade;
proxy_http_version 1.1;
proxy_buffering off;
proxy_read_timeout 3600s;
proxy_send_timeout 3600s;
`;

  const squidCommon = `acl client_localnet src 10.0.0.0/8
acl client_localnet src 100.64.0.0/10
acl client_localnet src 172.16.0.0/12
acl client_localnet src 192.168.0.0/16
acl client_localnet src fc00::/7
acl client_localnet src fe80::/10
acl to_private_networks dst 0.0.0.0/8
acl to_private_networks dst 10.0.0.0/8
acl to_private_networks dst 100.64.0.0/10
acl to_private_networks dst 127.0.0.0/8
acl to_private_networks dst 169.254.0.0/16
acl to_private_networks dst 172.16.0.0/12
acl to_private_networks dst 192.168.0.0/16
acl to_private_networks dst 224.0.0.0/4
acl to_private_networks dst 240.0.0.0/4
acl to_private_networks dst ::/128
acl to_private_networks dst ::1/128
acl to_private_networks dst ::ffff:0:0/96
acl to_private_networks dst ::/96
acl to_private_networks dst fc00::/7
acl to_private_networks dst fe80::/10
acl SSL_ports port 443
acl Safe_ports port 80
acl Safe_ports port 21
acl Safe_ports port 443
acl Safe_ports port 1025-65535
acl CONNECT method CONNECT
http_port 3128
coredump_dir /var/spool/squid
refresh_pattern . 0 20% 4320
client_request_buffer_max_size 100 MB
max_filedescriptors 65536
connect_timeout 30 seconds
request_timeout 2 minutes
read_timeout 2 minutes
client_lifetime 5 minutes
shutdown_lifetime 30 seconds
cache_mem 256 MB
maximum_object_size_in_memory 512 KB
dns_timeout 30 seconds
logformat dify_log %ts.%03tu %6tr %>a %Ss/%03>Hs %<st %rm %ru %[un %Sh/%<a %mt
access_log daemon:/var/log/squid/access.log dify_log
http_access deny !Safe_ports
http_access deny CONNECT !SSL_ports
`;

  const squidSandbox = `${squidCommon}acl allowed_domains dstdomain .marketplace.dify.ai
http_access allow localhost manager
http_access deny manager
http_access deny to_private_networks
http_access allow allowed_domains
http_access allow client_localnet
http_access allow localhost
http_access deny all
`;

  const squidAgent = `${squidCommon}acl dst_agent_backend dstdomain ${name}-agent-backend
acl dst_dify_api dstdomain ${name}-api
acl path_files urlpath_regex -i ^/files/
acl path_agent_stub urlpath_regex -i ^/agent-stub/
http_access allow dst_agent_backend path_agent_stub
http_access allow dst_dify_api path_files
http_access deny to_private_networks
http_access allow all
`;

  const sandboxConfig = `app:
  port: 8194
  debug: false
  key: ${sandboxKey}
max_workers: 4
max_requests: 50
worker_timeout: 15
enable_network: true
allowed_syscalls:
proxy:
  socks5: ""
  http: ${ssrfProxyUrl}
  https: ${ssrfProxyUrl}
`;

  services.push({
    type: "app",
    data: {
      serviceName: name,
      source: {
        type: "image",
        image: "nginx:1.30.6-alpine",
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: nginxConf,
          mountPath: "/etc/nginx/nginx.conf",
        },
        {
          type: "file",
          content: nginxProxyConf,
          mountPath: "/etc/nginx/proxy.conf",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-storage`,
      source: {
        type: "image",
        image: "busybox:1.37.0",
      },
      deploy: {
        command: `mkdir -p /project/${name}-storage && chown -R 1001:1001 /project/${name}-storage && exec sleep 2147483647`,
      },
      mounts: [
        {
          type: "bind",
          hostPath: "/etc/easypanel/projects/$(PROJECT_NAME)",
          mountPath: "/project",
        },
      ],
    },
  });

  const firewallState = `/etc/easypanel/projects/$(PROJECT_NAME)/${name}-sandbox-firewall/volumes/state`;
  const waitForFirewall = (command: string) =>
    `until [ -f /firewall/$(cat /etc/hostname) ]; do echo "Waiting for sandbox firewall"; sleep 1; done; exec ${command}`;

  const firewallScript = `set -e
apk add --no-cache -q docker-cli iptables util-linux > /dev/null
service_ips() {
  docker service inspect "$1" -f '{{range .Endpoint.VirtualIPs}}{{.Addr}} {{end}}' | tr ' ' '\\n' | cut -d/ -f1
  docker ps -q -f "label=com.docker.swarm.service.name=$1" | xargs -r docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}} {{end}}' | tr ' ' '\\n'
}
apply_rules() {
  ns=$1
  shift
  $ns iptables -N SANDBOX_EGRESS 2> /dev/null || $ns iptables -F SANDBOX_EGRESS || return 1
  $ns iptables -C OUTPUT -j SANDBOX_EGRESS 2> /dev/null || $ns iptables -I OUTPUT -j SANDBOX_EGRESS || return 1
  $ns iptables -A SANDBOX_EGRESS -o lo -j RETURN || return 1
  $ns iptables -A SANDBOX_EGRESS -m conntrack --ctstate ESTABLISHED,RELATED -j RETURN || return 1
  for ip in "$@"; do
    $ns iptables -A SANDBOX_EGRESS -d "$ip" -p tcp --dport 3128 -j RETURN || return 1
  done
  $ns iptables -A SANDBOX_EGRESS -j REJECT || return 1
}
protect() {
  ips=$(service_ips "$2" | grep -v '^$' | sort -u | tr '\\n' ' ')
  [ -n "$ips" ] || return 0
  for container in $(docker ps -q -f "label=com.docker.swarm.service.name=$1"); do
    pid=$(docker inspect -f '{{.State.Pid}}' "$container") || continue
    ns="nsenter --net=/hostproc/$pid/ns/net"
    state="$container $ips"
    if [ "$(cat "/state/$container" 2>/dev/null)" = "$state" ] && $ns iptables -C SANDBOX_EGRESS -j REJECT 2> /dev/null; then
      continue
    fi
    rm -f "/state/$container"
    if apply_rules "$ns" $ips; then
      echo "$state" > "/state/$container"
      echo "egress limited to proxy for $1 ($container)"
    else
      echo "could not limit egress for $1 ($container), retrying"
    fi
  done
}
while true; do
  protect "$SANDBOX_SERVICE" "$SANDBOX_PROXY_SERVICE" || true
  protect "$AGENT_SANDBOX_SERVICE" "$AGENT_PROXY_SERVICE" || true
  running=$(docker ps -q)
  for f in /state/*; do
    if [ -f "$f" ] && ! echo "$running" | grep -qx "\${f#/state/}"; then
      rm -f "$f"
    fi
  done
  sleep 5
done
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-sandbox-firewall`,
      source: {
        type: "image",
        image: "alpine:3.22",
      },
      env: [
        `SANDBOX_SERVICE=$(PROJECT_NAME)_${name}-sandbox`,
        `SANDBOX_PROXY_SERVICE=$(PROJECT_NAME)_${name}-ssrf-proxy`,
        `AGENT_SANDBOX_SERVICE=$(PROJECT_NAME)_${name}-local-sandbox`,
        `AGENT_PROXY_SERVICE=$(PROJECT_NAME)_${name}-agent-ssrf-proxy`,
      ].join("\n"),
      deploy: {
        command: "sh /scripts/firewall.sh",
        capAdd: ["NET_ADMIN", "SYS_ADMIN", "SYS_PTRACE"],
      },
      mounts: [
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
        {
          type: "bind",
          hostPath: "/proc",
          mountPath: "/hostproc",
        },
        {
          type: "file",
          content: firewallScript,
          mountPath: "/scripts/firewall.sh",
        },
        {
          type: "volume",
          name: "state",
          mountPath: "/state",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-api`,
      source: {
        type: "image",
        image: apiImage,
      },
      env: [...backendEnv, "MODE=api", "MIGRATION_ENABLED=true"].join("\n"),
      mounts: [storageMount],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-websocket`,
      source: {
        type: "image",
        image: apiImage,
      },
      env: [
        ...backendEnv.filter(
          (line) =>
            !line.startsWith("SERVER_WORKER_CLASS=") &&
            !line.startsWith("SERVER_WORKER_AMOUNT=")
        ),
        "MODE=api",
        "MIGRATION_ENABLED=false",
        "SERVER_WORKER_AMOUNT=1",
        "SERVER_WORKER_CLASS=geventwebsocket.gunicorn.workers.GeventWebSocketWorker",
        "SERVER_WORKER_CONNECTIONS=1000",
      ].join("\n"),
      mounts: [storageMount],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-worker`,
      source: {
        type: "image",
        image: apiImage,
      },
      env: [...backendEnv, "MODE=worker", "MIGRATION_ENABLED=false"].join("\n"),
      mounts: [storageMount],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-worker-beat`,
      source: {
        type: "image",
        image: apiImage,
      },
      deploy: {
        zeroDowntime: false,
      },
      env: [...backendEnv, "MODE=beat", "MIGRATION_ENABLED=false"].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-web`,
      source: {
        type: "image",
        image: webImage,
      },
      env: [
        "DEPLOY_ENV=PRODUCTION",
        "CONSOLE_API_URL=",
        "APP_API_URL=",
        `SERVER_CONSOLE_API_URL=${apiUrl}`,
        `NEXT_PUBLIC_SOCKET_URL=wss://${domain}`,
        "MARKETPLACE_API_URL=https://marketplace.dify.ai",
        "MARKETPLACE_URL=https://marketplace.dify.ai",
        "NEXT_PUBLIC_ENABLE_AGENT_V2=true",
        "NEXT_TELEMETRY_DISABLED=1",
        "TEXT_GENERATION_TIMEOUT_MS=60000",
        "LOOP_NODE_MAX_COUNT=100",
        "MAX_TOOLS_NUM=10",
        "MAX_PARALLEL_LIMIT=10",
        "MAX_ITERATIONS_NUM=99",
        "MAX_TREE_DEPTH=50",
        "TOP_K_MAX_VALUE=10",
        "INDEXING_MAX_SEGMENTATION_TOKENS_LENGTH=4000",
        "ALLOW_EMBED=false",
        "ALLOW_UNSAFE_DATA_SCHEME=false",
        "ENABLE_WEBSITE_JINAREADER=true",
        "ENABLE_WEBSITE_FIRECRAWL=true",
        "ENABLE_WEBSITE_WATERCRAWL=true",
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-plugin-daemon`,
      source: {
        type: "image",
        image: "langgenius/dify-plugin-daemon:0.6.14-local",
      },
      deploy: {
        zeroDowntime: false,
      },
      env: [
        "DB_TYPE=postgresql",
        `DB_HOST=${dbHost}`,
        "DB_PORT=5432",
        "DB_USERNAME=postgres",
        `DB_PASSWORD=${databasePassword}`,
        "DB_DATABASE=dify_plugin",
        "DB_SSL_MODE=disable",
        `REDIS_HOST=${redisHost}`,
        "REDIS_PORT=6379",
        `REDIS_PASSWORD=${redisPassword}`,
        "SERVER_PORT=5002",
        `SERVER_KEY=${pluginDaemonKey}`,
        `DIFY_INNER_API_URL=${apiUrl}`,
        `DIFY_INNER_API_KEY=${pluginInnerKey}`,
        "PLUGIN_REMOTE_INSTALLING_HOST=0.0.0.0",
        "PLUGIN_REMOTE_INSTALLING_PORT=5003",
        "PLUGIN_STORAGE_TYPE=local",
        "PLUGIN_STORAGE_LOCAL_ROOT=/app/storage",
        "PLUGIN_WORKING_PATH=/app/storage/cwd",
        "PLUGIN_INSTALLED_PATH=plugin",
        "PLUGIN_PACKAGE_CACHE_PATH=plugin_packages",
        "PLUGIN_MEDIA_CACHE_PATH=assets",
        "MAX_PLUGIN_PACKAGE_SIZE=52428800",
        "PYTHON_ENV_INIT_TIMEOUT=120",
        "PLUGIN_MAX_EXECUTION_TIMEOUT=600",
        "FORCE_VERIFYING_SIGNATURE=true",
        "PPROF_ENABLED=false",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "storage",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-agent-backend`,
      source: {
        type: "image",
        image: `langgenius/dify-agent-backend:${agentImageTag}`,
      },
      env: [
        `DIFY_AGENT_API_TOKEN=${agentToken}`,
        `DIFY_AGENT_REDIS_URL=redis://:${redisPassword}@${redisHost}:6379/2`,
        `DIFY_AGENT_PLUGIN_DAEMON_URL=${pluginDaemonUrl}`,
        `DIFY_AGENT_PLUGIN_DAEMON_API_KEY=${pluginDaemonKey}`,
        `DIFY_AGENT_INNER_API_URL=${apiUrl}`,
        `DIFY_AGENT_INNER_API_KEY=${pluginInnerKey}`,
        "DIFY_AGENT_RUNTIME_BACKEND=local",
        `DIFY_AGENT_LOCAL_SANDBOX_ENDPOINT=http://${name}-local-sandbox:5004`,
        `DIFY_AGENT_LOCAL_SANDBOX_AUTH_TOKEN=${localSandboxToken}`,
        `DIFY_AGENT_SANDBOX_FILES_BASE_URL=${apiUrl}`,
        `DIFY_AGENT_STUB_API_BASE_URL=${agentBackendUrl}/agent-stub`,
        `DIFY_AGENT_SERVER_SECRET_KEY=${agentServerSecret}`,
      ].join("\n"),
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-local-sandbox`,
      source: {
        type: "image",
        image: `langgenius/dify-agent-local-sandbox:${agentImageTag}`,
      },
      env: [
        `SHELLCTL_AUTH_TOKEN=${localSandboxToken}`,
        `HTTP_PROXY=${agentProxyUrl}`,
        `HTTPS_PROXY=${agentProxyUrl}`,
        "NO_PROXY=localhost,127.0.0.1",
      ].join("\n"),
      deploy: {
        command: waitForFirewall(
          "shellctl serve --listen 0.0.0.0:5004 --require-auth-token"
        ),
        zeroDowntime: false,
      },
      mounts: [
        {
          type: "volume",
          name: "home",
          mountPath: "/home/dify",
        },
        {
          type: "volume",
          name: "workspace",
          mountPath: "/workspace",
        },
        {
          type: "bind",
          hostPath: firewallState,
          mountPath: "/firewall",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-agent-ssrf-proxy`,
      source: {
        type: "image",
        image: "ubuntu/squid:6.6-24.04_beta",
      },
      mounts: [
        {
          type: "file",
          content: squidAgent,
          mountPath: "/etc/squid/squid.conf",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-sandbox`,
      source: {
        type: "image",
        image: "langgenius/dify-sandbox:0.2.15",
      },
      env: [
        `API_KEY=${sandboxKey}`,
        "GIN_MODE=release",
        "WORKER_TIMEOUT=15",
        "ENABLE_NETWORK=true",
        `HTTP_PROXY=${ssrfProxyUrl}`,
        `HTTPS_PROXY=${ssrfProxyUrl}`,
        "SANDBOX_PORT=8194",
      ].join("\n"),
      deploy: {
        command: waitForFirewall("/entrypoint.sh"),
      },
      mounts: [
        {
          type: "file",
          content: sandboxConfig,
          mountPath: "/conf/config.yaml",
        },
        {
          type: "volume",
          name: "dependencies",
          mountPath: "/dependencies",
        },
        {
          type: "bind",
          hostPath: firewallState,
          mountPath: "/firewall",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-ssrf-proxy`,
      source: {
        type: "image",
        image: "ubuntu/squid:6.6-24.04_beta",
      },
      mounts: [
        {
          type: "file",
          content: squidSandbox,
          mountPath: "/etc/squid/squid.conf",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-weaviate`,
      source: {
        type: "image",
        image: "cr.weaviate.io/semitechnologies/weaviate:1.39.13",
      },
      deploy: {
        zeroDowntime: false,
      },
      env: [
        "PERSISTENCE_DATA_PATH=/var/lib/weaviate",
        "QUERY_DEFAULTS_LIMIT=25",
        "AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=false",
        "DEFAULT_VECTORIZER_MODULE=none",
        "CLUSTER_HOSTNAME=node1",
        "AUTHENTICATION_APIKEY_ENABLED=true",
        `AUTHENTICATION_APIKEY_ALLOWED_KEYS=${weaviateKey}`,
        "AUTHENTICATION_APIKEY_USERS=dify",
        "AUTHORIZATION_ADMINLIST_ENABLED=true",
        "AUTHORIZATION_ADMINLIST_USERS=dify",
        "DISABLE_TELEMETRY=true",
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/weaviate",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-db`,
      source: {
        type: "image",
        image: "postgres:15.20-alpine",
      },
      env: [
        "POSTGRES_USER=postgres",
        `POSTGRES_PASSWORD=${databasePassword}`,
        "POSTGRES_DB=dify",
        "PGDATA=/var/lib/postgresql/data/pgdata",
      ].join("\n"),
      deploy: {
        command:
          "docker-entrypoint.sh postgres -c max_connections=200 -c shared_buffers=128MB -c work_mem=4MB -c maintenance_work_mem=64MB -c effective_cache_size=4096MB -c tcp_keepalives_idle=60 -c tcp_keepalives_interval=30 -c tcp_keepalives_count=5",
        zeroDowntime: false,
      },
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/var/lib/postgresql/data",
        },
      ],
    },
  });

  services.push({
    type: "redis",
    data: {
      serviceName: redisHost,
      password: redisPassword,
    },
  });

  return { services };
}
