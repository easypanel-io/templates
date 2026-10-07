import {
  Output,
  randomPassword,
  randomString,
  Services,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const crypto = require("crypto");

  const name = input.appServiceName;
  const host = (service: string) => `$(PROJECT_NAME)_${name}-${service}`;

  const base64url = (buf: Buffer) =>
    buf
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const signJwt = (payload: Record<string, unknown>, secret: string) => {
    const header = { alg: "HS256", typ: "JWT" };
    const headerPart = base64url(Buffer.from(JSON.stringify(header)));
    const payloadPart = base64url(Buffer.from(JSON.stringify(payload)));
    const signed = `${headerPart}.${payloadPart}`;
    const signature = base64url(
      crypto.createHmac("sha256", secret).update(signed).digest()
    );
    return `${signed}.${signature}`;
  };

  const dbPassword = randomPassword();
  const jwtSecret = crypto.randomBytes(30).toString("base64");
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 5 * 365 * 24 * 3600;
  const anonKey = signJwt(
    { role: "anon", iss: "supabase", iat, exp },
    jwtSecret
  );
  const serviceRoleKey = signJwt(
    { role: "service_role", iss: "supabase", iat, exp },
    jwtSecret
  );

  const secretKeyBase = crypto.randomBytes(48).toString("base64");
  const vaultEncKey = crypto.randomBytes(16).toString("hex");
  const pgMetaCryptoKey = crypto.randomBytes(24).toString("base64");
  const logflarePublicToken = crypto.randomBytes(24).toString("base64");
  const logflarePrivateToken = crypto.randomBytes(24).toString("base64");
  const s3AccessKeyId = crypto.randomBytes(16).toString("hex");
  const s3AccessKeySecret = crypto.randomBytes(32).toString("hex");
  const poolerTenantId = randomString(12);
  const dashboardPassword = input.dashboardPassword?.trim()
    ? input.dashboardPassword.trim()
    : randomPassword();

  const publicUrl = `https://$(PROJECT_NAME)-${name}-kong.$(EASYPANEL_HOST)`;

  const realtimeSql = `\\set pguser \`echo "$POSTGRES_USER"\`

create schema if not exists _realtime;
alter schema _realtime owner to :pguser;
`;

  const webhooksSql = `BEGIN;
  -- Create pg_net extension
  CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
  -- Create supabase_functions schema
  CREATE SCHEMA supabase_functions AUTHORIZATION supabase_admin;
  GRANT USAGE ON SCHEMA supabase_functions TO postgres, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA supabase_functions GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
  ALTER DEFAULT PRIVILEGES IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
  -- supabase_functions.migrations definition
  CREATE TABLE supabase_functions.migrations (
    version text PRIMARY KEY,
    inserted_at timestamptz NOT NULL DEFAULT NOW()
  );
  -- Initial supabase_functions migration
  INSERT INTO supabase_functions.migrations (version) VALUES ('initial');
  -- supabase_functions.hooks definition
  CREATE TABLE supabase_functions.hooks (
    id bigserial PRIMARY KEY,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW(),
    request_id bigint
  );
  CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);
  CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);
  COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';
  CREATE FUNCTION supabase_functions.http_request()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $function$
    DECLARE
      request_id bigint;
      payload jsonb;
      url text := TG_ARGV[0]::text;
      method text := TG_ARGV[1]::text;
      headers jsonb DEFAULT '{}'::jsonb;
      params jsonb DEFAULT '{}'::jsonb;
      timeout_ms integer DEFAULT 1000;
    BEGIN
      IF url IS NULL OR url = 'null' THEN
        RAISE EXCEPTION 'url argument is missing';
      END IF;

      IF method IS NULL OR method = 'null' THEN
        RAISE EXCEPTION 'method argument is missing';
      END IF;

      IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
        headers = '{"Content-Type": "application/json"}'::jsonb;
      ELSE
        headers = TG_ARGV[2]::jsonb;
      END IF;

      IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
        params = '{}'::jsonb;
      ELSE
        params = TG_ARGV[3]::jsonb;
      END IF;

      IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
        timeout_ms = 1000;
      ELSE
        timeout_ms = TG_ARGV[4]::integer;
      END IF;

      CASE
        WHEN method = 'GET' THEN
          SELECT http_get INTO request_id FROM net.http_get(
            url,
            params,
            headers,
            timeout_ms
          );
        WHEN method = 'POST' THEN
          payload = jsonb_build_object(
            'old_record', OLD,
            'record', NEW,
            'type', TG_OP,
            'table', TG_TABLE_NAME,
            'schema', TG_TABLE_SCHEMA
          );

          SELECT http_post INTO request_id FROM net.http_post(
            url,
            payload,
            params,
            headers,
            timeout_ms
          );
        ELSE
          RAISE EXCEPTION 'method argument % is invalid', method;
      END CASE;

      INSERT INTO supabase_functions.hooks
        (hook_table_id, hook_name, request_id)
      VALUES
        (TG_RELID, TG_NAME, request_id);

      RETURN NEW;
    END
  $function$;
  -- Supabase super admin
  DO
  $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;
  END
  $$;
  GRANT ALL PRIVILEGES ON SCHEMA supabase_functions TO supabase_functions_admin;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA supabase_functions TO supabase_functions_admin;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA supabase_functions TO supabase_functions_admin;
  ALTER USER supabase_functions_admin SET search_path = "supabase_functions";
  ALTER table "supabase_functions".migrations OWNER TO supabase_functions_admin;
  ALTER table "supabase_functions".hooks OWNER TO supabase_functions_admin;
  ALTER function "supabase_functions".http_request() OWNER TO supabase_functions_admin;
  GRANT supabase_functions_admin TO postgres;
  -- Remove unused supabase_pg_net_admin role
  DO
  $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_pg_net_admin'
    )
    THEN
      REASSIGN OWNED BY supabase_pg_net_admin TO supabase_admin;
      DROP OWNED BY supabase_pg_net_admin;
      DROP ROLE supabase_pg_net_admin;
    END IF;
  END
  $$;
  -- pg_net grants when extension is already enabled
  DO
  $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_extension
      WHERE extname = 'pg_net'
    )
    THEN
      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END
  $$;
  -- Event trigger for pg_net
  CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
  RETURNS event_trigger
  LANGUAGE plpgsql
  AS $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END;
  $$;
  COMMENT ON FUNCTION extensions.grant_pg_net_access IS 'Grants access to pg_net';
  DO
  $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_event_trigger
      WHERE evtname = 'issue_pg_net_access'
    ) THEN
      CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end WHEN TAG IN ('CREATE EXTENSION')
      EXECUTE PROCEDURE extensions.grant_pg_net_access();
    END IF;
  END
  $$;
  INSERT INTO supabase_functions.migrations (version) VALUES ('20210809183423_update_grants');
  ALTER function supabase_functions.http_request() SECURITY DEFINER;
  ALTER function supabase_functions.http_request() SET search_path = supabase_functions;
  REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
  GRANT EXECUTE ON FUNCTION supabase_functions.http_request() TO postgres, anon, authenticated, service_role;
COMMIT;
`;

  const rolesSql = `\\set pgpass \`echo "$POSTGRES_PASSWORD"\`

ALTER USER authenticator WITH PASSWORD :'pgpass';
ALTER USER pgbouncer WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_functions_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin WITH PASSWORD :'pgpass';
`;

  const jwtSql = `\\set jwt_secret \`echo "$JWT_SECRET"\`
\\set jwt_exp \`echo "$JWT_EXP"\`

ALTER DATABASE postgres SET "app.settings.jwt_secret" TO :'jwt_secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO :'jwt_exp';
`;

  const supabaseDbSql = `\\set pguser \`echo "$POSTGRES_USER"\`

CREATE DATABASE _supabase WITH OWNER :pguser;
`;

  const logsSql = `\\set pguser \`echo "$POSTGRES_USER"\`

\\c _supabase
create schema if not exists _analytics;
alter schema _analytics owner to :pguser;
\\c postgres
`;

  const poolerSql = `\\set pguser \`echo "$POSTGRES_USER"\`

\\c _supabase
create schema if not exists _supavisor;
alter schema _supavisor owner to :pguser;
\\c postgres
`;

  const kongEntrypointSh = `#!/bin/bash
# Build Lua expressions for translating opaque API keys to asymmetric JWTs.
# Opaque keys are not configured in this template, so these fall through to
# legacy-only behavior - just passing apikey as-is.
export LUA_AUTH_EXPR="\\$((headers.authorization ~= nil and headers.authorization:sub(1, 10) ~= 'Bearer sb_' and headers.authorization) or headers.apikey)"
export LUA_RT_WS_EXPR="\\$(query_params.apikey)"

# Substitute environment variables in the Kong declarative config.
awk '{
  result = ""
  rest = $0
  while (match(rest, /\\$[A-Za-z_][A-Za-z_0-9]*/)) {
    varname = substr(rest, RSTART + 1, RLENGTH - 1)
    if (varname in ENVIRON) {
      result = result substr(rest, 1, RSTART - 1) ENVIRON[varname]
    } else {
      result = result substr(rest, 1, RSTART + RLENGTH - 1)
    }
    rest = substr(rest, RSTART + RLENGTH)
  }
  print result rest
}' /home/kong/temp.yml > "$KONG_DECLARATIVE_CONFIG"

# Remove empty key-auth credentials (unconfigured opaque keys)
sed -i '/^[[:space:]]*- key:[[:space:]]*$/d' "$KONG_DECLARATIVE_CONFIG"

exec /docker-entrypoint.sh kong docker-start
`;

  const kongYml = `_format_version: '2.1'
_transform: true

consumers:
  - username: DASHBOARD
  - username: anon
    keyauth_credentials:
      - key: $SUPABASE_ANON_KEY
  - username: service_role
    keyauth_credentials:
      - key: $SUPABASE_SERVICE_KEY

acls:
  - consumer: anon
    group: anon
  - consumer: service_role
    group: admin

basicauth_credentials:
  - consumer: DASHBOARD
    username: '$DASHBOARD_USERNAME'
    password: '$DASHBOARD_PASSWORD'

services:
  - name: auth-v1-open
    url: http://${host("auth")}:9999/verify
    routes:
      - name: auth-v1-open
        strip_path: true
        paths:
          - /auth/v1/verify
    plugins:
      - name: cors
  - name: auth-v1-open-callback
    url: http://${host("auth")}:9999/callback
    routes:
      - name: auth-v1-open-callback
        strip_path: true
        paths:
          - /auth/v1/callback
    plugins:
      - name: cors
  - name: auth-v1-open-authorize
    url: http://${host("auth")}:9999/authorize
    routes:
      - name: auth-v1-open-authorize
        strip_path: true
        paths:
          - /auth/v1/authorize
    plugins:
      - name: cors
  - name: auth-v1-open-jwks
    url: http://${host("auth")}:9999/.well-known/jwks.json
    routes:
      - name: auth-v1-open-jwks
        strip_path: true
        paths:
          - /auth/v1/.well-known/jwks.json
    plugins:
      - name: cors

  - name: auth-v1
    url: http://${host("auth")}:9999/
    routes:
      - name: auth-v1-all
        strip_path: true
        paths:
          - /auth/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: request-transformer
        config:
          add:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
          replace:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: rest-v1
    url: http://${host("rest")}:3000/
    routes:
      - name: rest-v1-all
        strip_path: true
        paths:
          - /rest/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: request-transformer
        config:
          add:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
          replace:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: graphql-v1
    url: http://${host("rest")}:3000/rpc/graphql
    routes:
      - name: graphql-v1-all
        strip_path: true
        paths:
          - /graphql/v1
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: request-transformer
        config:
          add:
            headers:
              - "Content-Profile: graphql_public"
              - "Authorization: $LUA_AUTH_EXPR"
          replace:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: realtime-v1-ws
    url: http://${host("realtime")}:4000/socket
    protocol: ws
    routes:
      - name: realtime-v1-ws
        strip_path: true
        paths:
          - /realtime/v1/
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: request-transformer
        config:
          add:
            headers:
              - "x-api-key:$LUA_RT_WS_EXPR"
              - "Host:realtime-dev"
          replace:
            querystring:
              - "apikey:$LUA_RT_WS_EXPR"
            headers:
              - "Host:realtime-dev"
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: realtime-v1-rest
    url: http://${host("realtime")}:4000/api
    protocol: http
    routes:
      - name: realtime-v1-rest
        strip_path: true
        paths:
          - /realtime/v1/api
    plugins:
      - name: cors
      - name: key-auth
        config:
          hide_credentials: false
      - name: request-transformer
        config:
          add:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
              - "Host:realtime-dev"
          replace:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
              - "Host:realtime-dev"
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin
            - anon

  - name: storage-v1
    url: http://${host("storage")}:5000/
    routes:
      - name: storage-v1-all
        strip_path: true
        paths:
          - /storage/v1/
    plugins:
      - name: cors
      - name: request-transformer
        config:
          add:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
          replace:
            headers:
              - "Authorization: $LUA_AUTH_EXPR"
      - name: post-function
        config:
          access:
            - |
              local auth = kong.request.get_header("authorization")
              if auth == nil or auth == "" or auth:find("^%s*$") then
                kong.service.request.clear_header("authorization")
              end

  - name: functions-v1
    url: http://${host("functions")}:9000/
    read_timeout: 150000
    routes:
      - name: functions-v1-all
        strip_path: true
        paths:
          - /functions/v1/
    plugins:
      - name: cors

  - name: well-known-oauth
    url: http://${host("auth")}:9999/.well-known/oauth-authorization-server
    routes:
      - name: well-known-oauth
        strip_path: true
        paths:
          - /.well-known/oauth-authorization-server
    plugins:
      - name: cors

  - name: meta
    url: http://${host("meta")}:8080/
    routes:
      - name: meta-all
        strip_path: true
        paths:
          - /pg/
    plugins:
      - name: key-auth
        config:
          hide_credentials: false
      - name: acl
        config:
          hide_groups_header: true
          allow:
            - admin

  - name: mcp-blocker
    url: http://${host("studio")}:3000/api/mcp
    routes:
      - name: mcp-blocker-route
        strip_path: true
        paths:
          - /api/mcp
    plugins:
      - name: request-termination
        config:
          status_code: 403
          message: "Access is forbidden."

  - name: dashboard
    url: http://${host("studio")}:3000/
    routes:
      - name: dashboard-all
        strip_path: true
        paths:
          - /
    plugins:
      - name: cors
      - name: basic-auth
        config:
          hide_credentials: true
`;

  const vectorYml = `api:
  enabled: true
  address: 0.0.0.0:9001

sources:
  docker_host:
    type: docker_logs
    exclude_containers:
      - supabase-vector

transforms:
  project_logs:
    type: remap
    inputs:
      - docker_host
    source: |-
      .project = "default"
      .event_message = del(.message)
      .appname = del(.container_name)
      del(.container_created_at)
      del(.container_id)
      del(.source_type)
      del(.stream)
      del(.label)
      del(.image)
      del(.host)
      del(.stream)
  router:
    type: route
    inputs:
      - project_logs
    route:
      kong: '.appname == "${name}-kong"'
      auth: '.appname == "${name}-auth"'
      rest: '.appname == "${name}-rest"'
      realtime: '.appname == "${name}-realtime"'
      storage: '.appname == "${name}-storage"'
      functions: '.appname == "${name}-functions"'
      db: '.appname == "${name}-db"'
  kong_logs:
    type: remap
    inputs:
      - router.kong
    source: |-
      req, err = parse_nginx_log(.event_message, "combined")
      if err == null {
          .timestamp = req.timestamp
          .metadata.request.headers.referer = req.referer
          .metadata.request.headers.user_agent = req.agent
          .metadata.request.headers.cf_connecting_ip = req.client
          .metadata.response.status_code = req.status
          url, split_err = split(req.request, " ")
          if split_err == null {
              .metadata.request.method = url[0]
              .metadata.request.path = url[1]
              .metadata.request.protocol = url[2]
          }
      }
      if err != null {
        abort
      }
  kong_err:
    type: remap
    inputs:
      - router.kong
    source: |-
      .metadata.request.method = "GET"
      .metadata.response.status_code = 200
      parsed, err = parse_nginx_log(.event_message, "error")
      if err == null {
          .timestamp = parsed.timestamp
          .severity = parsed.severity
          .metadata.request.host = parsed.host
          .metadata.request.headers.cf_connecting_ip = parsed.client
          url, err = split(parsed.request, " ")
          if err == null {
              .metadata.request.method = url[0]
              .metadata.request.path = url[1]
              .metadata.request.protocol = url[2]
          }
      }
      if err != null {
        abort
      }
  auth_logs:
    type: remap
    inputs:
      - router.auth
    source: |-
      parsed, err = parse_json(.event_message)
      if err == null {
          .metadata.timestamp = parsed.time
          .metadata = merge!(.metadata, parsed)
      }
  rest_logs:
    type: remap
    inputs:
      - router.rest
    source: |-
      parsed, err = parse_regex(.event_message, r'^(?P<time>.*): (?P<msg>.*)$')
      if err == null {
          .event_message = parsed.msg
          .timestamp = parse_timestamp!(value: parsed.time,format: "%d/%b/%Y:%H:%M:%S %z")
          .metadata.host = .project
      }
  realtime_logs_filtered:
    type: filter
    inputs:
      - router.realtime
    condition: '!contains(string!(.event_message), "/health")'
  realtime_logs:
    type: remap
    inputs:
      - realtime_logs_filtered
    source: |-
      .metadata.project = del(.project)
      .metadata.external_id = .metadata.project
      parsed, err = parse_regex(.event_message, r'^(?P<time>\\d+:\\d+:\\d+\\.\\d+) \\[(?P<level>\\w+)\\] (?P<msg>.*)$')
      if err == null {
          .event_message = parsed.msg
          .metadata.level = parsed.level
      }
  functions_logs:
    type: remap
    inputs:
      - router.functions
    source: |-
      .metadata.project_ref = del(.project)
  storage_logs:
    type: remap
    inputs:
      - router.storage
    source: |-
      .metadata.project = del(.project)
      .metadata.tenantId = .metadata.project
      parsed, err = parse_json(.event_message)
      if err == null {
          .event_message = parsed.msg
          .metadata.level = parsed.level
          .metadata.timestamp = parsed.time
          .metadata.context[0].host = parsed.hostname
          .metadata.context[0].pid = parsed.pid
      }
  db_logs:
    type: remap
    inputs:
      - router.db
    source: |-
      .metadata.host = "db-default"
      .metadata.parsed.timestamp = .timestamp

      parsed, err = parse_regex(.event_message, r'.*(?P<level>INFO|NOTICE|WARNING|ERROR|LOG|FATAL|PANIC?):.*', numeric_groups: true)

      if err != null || parsed == null {
        .metadata.parsed.error_severity = "info"
      }
      if parsed.level != null {
       .metadata.parsed.error_severity = parsed.level
      }
      if .metadata.parsed.error_severity == "info" {
          .metadata.parsed.error_severity = "log"
      }
      .metadata.parsed.error_severity = upcase!(.metadata.parsed.error_severity)

sinks:
  logflare_auth:
    type: 'http'
    inputs:
      - auth_logs
    encoding:
      codec: 'json'
    method: 'post'
    request:
      retry_max_duration_secs: 30
      retry_initial_backoff_secs: 1
      headers:
        x-api-key: \${LOGFLARE_PUBLIC_ACCESS_TOKEN?LOGFLARE_PUBLIC_ACCESS_TOKEN is required}
    uri: 'http://${host(
      "analytics"
    )}:4000/api/logs?source_name=gotrue.logs.prod'
  logflare_realtime:
    type: 'http'
    inputs:
      - realtime_logs
    encoding:
      codec: 'json'
    method: 'post'
    request:
      retry_max_duration_secs: 30
      retry_initial_backoff_secs: 1
      headers:
        x-api-key: \${LOGFLARE_PUBLIC_ACCESS_TOKEN?LOGFLARE_PUBLIC_ACCESS_TOKEN is required}
    uri: 'http://${host(
      "analytics"
    )}:4000/api/logs?source_name=realtime.logs.prod'
  logflare_rest:
    type: 'http'
    inputs:
      - rest_logs
    encoding:
      codec: 'json'
    method: 'post'
    request:
      retry_max_duration_secs: 30
      retry_initial_backoff_secs: 1
      headers:
        x-api-key: \${LOGFLARE_PUBLIC_ACCESS_TOKEN?LOGFLARE_PUBLIC_ACCESS_TOKEN is required}
    uri: 'http://${host(
      "analytics"
    )}:4000/api/logs?source_name=postgREST.logs.prod'
  logflare_db:
    type: 'http'
    inputs:
      - db_logs
    encoding:
      codec: 'json'
    method: 'post'
    request:
      retry_max_duration_secs: 30
      retry_initial_backoff_secs: 1
      headers:
        x-api-key: \${LOGFLARE_PUBLIC_ACCESS_TOKEN?LOGFLARE_PUBLIC_ACCESS_TOKEN is required}
    uri: 'http://${host("analytics")}:4000/api/logs?source_name=postgres.logs'
  logflare_functions:
    type: 'http'
    inputs:
      - functions_logs
    encoding:
      codec: 'json'
    method: 'post'
    request:
      retry_max_duration_secs: 30
      retry_initial_backoff_secs: 1
      headers:
        x-api-key: \${LOGFLARE_PUBLIC_ACCESS_TOKEN?LOGFLARE_PUBLIC_ACCESS_TOKEN is required}
    uri: 'http://${host("analytics")}:4000/api/logs?source_name=deno-relay-logs'
  logflare_storage:
    type: 'http'
    inputs:
      - storage_logs
    encoding:
      codec: 'json'
    method: 'post'
    request:
      retry_max_duration_secs: 30
      retry_initial_backoff_secs: 1
      headers:
        x-api-key: \${LOGFLARE_PUBLIC_ACCESS_TOKEN?LOGFLARE_PUBLIC_ACCESS_TOKEN is required}
    uri: 'http://${host(
      "analytics"
    )}:4000/api/logs?source_name=storage.logs.prod.2'
  logflare_kong:
    type: 'http'
    inputs:
      - kong_logs
      - kong_err
    encoding:
      codec: 'json'
    method: 'post'
    request:
      retry_max_duration_secs: 30
      retry_initial_backoff_secs: 1
      headers:
        x-api-key: \${LOGFLARE_PUBLIC_ACCESS_TOKEN?LOGFLARE_PUBLIC_ACCESS_TOKEN is required}
    uri: 'http://${host(
      "analytics"
    )}:4000/api/logs?source_name=cloudflare.logs.prod'
`;

  const poolerExs = `{:ok, _} = Application.ensure_all_started(:supavisor)

{:ok, version} =
  case Supavisor.Repo.query!("select version()") do
    %{rows: [[ver]]} -> Supavisor.Helpers.parse_pg_version(ver)
    _ -> nil
  end

params = %{
  "external_id" => System.get_env("POOLER_TENANT_ID"),
  "db_host" => System.get_env("POSTGRES_HOST") || "db",
  "db_port" => System.get_env("POSTGRES_PORT"),
  "db_database" => System.get_env("POSTGRES_DB"),
  "require_user" => false,
  "auth_query" => "SELECT * FROM pgbouncer.get_auth($1)",
  "default_max_clients" => System.get_env("POOLER_MAX_CLIENT_CONN"),
  "default_pool_size" => System.get_env("POOLER_DEFAULT_POOL_SIZE"),
  "default_parameter_status" => %{"server_version" => version},
  "users" => [%{
    "db_user" => "pgbouncer",
    "db_password" => System.get_env("POSTGRES_PASSWORD"),
    "mode_type" => System.get_env("POOLER_POOL_MODE"),
    "pool_size" => System.get_env("POOLER_DEFAULT_POOL_SIZE"),
    "is_manager" => true
  }]
}

if !Supavisor.Tenants.get_tenant_by_external_id(params["external_id"]) do
  {:ok, _} = Supavisor.Tenants.create_tenant(params)
end
`;

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-db`,
      env: [
        `POSTGRES_HOST=/var/run/postgresql`,
        `PGPORT=5432`,
        `POSTGRES_PORT=5432`,
        `PGPASSWORD=${dbPassword}`,
        `POSTGRES_PASSWORD=${dbPassword}`,
        `PGDATABASE=postgres`,
        `POSTGRES_DB=postgres`,
        `JWT_SECRET=${jwtSecret}`,
        `JWT_EXP=3600`,
      ].join("\n"),
      source: {
        type: "dockerfile",
        dockerfile: "FROM supabase/postgres:15.8.1.085\nHEALTHCHECK NONE\n",
      },
      deploy: {
        command:
          "/usr/local/bin/docker-entrypoint.sh postgres -c config_file=/etc/postgresql/postgresql.conf -c log_min_messages=fatal",
      },
      mounts: [
        { type: "volume", name: "data", mountPath: "/var/lib/postgresql/data" },
        {
          type: "file",
          content: supabaseDbSql,
          mountPath: "/docker-entrypoint-initdb.d/migrations/97-_supabase.sql",
        },
        {
          type: "file",
          content: webhooksSql,
          mountPath: "/docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql",
        },
        {
          type: "file",
          content: rolesSql,
          mountPath: "/docker-entrypoint-initdb.d/init-scripts/99-roles.sql",
        },
        {
          type: "file",
          content: jwtSql,
          mountPath: "/docker-entrypoint-initdb.d/init-scripts/99-jwt.sql",
        },
        {
          type: "file",
          content: logsSql,
          mountPath: "/docker-entrypoint-initdb.d/migrations/99-logs.sql",
        },
        {
          type: "file",
          content: poolerSql,
          mountPath: "/docker-entrypoint-initdb.d/migrations/99-pooler.sql",
        },
        {
          type: "file",
          content: realtimeSql,
          mountPath: "/docker-entrypoint-initdb.d/migrations/99-realtime.sql",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-kong`,
      env: [
        `KONG_DATABASE=off`,
        `KONG_DECLARATIVE_CONFIG=/usr/local/kong/kong.yml`,
        `KONG_DNS_ORDER=LAST,A,CNAME`,
        `KONG_DNS_NOT_FOUND_TTL=1`,
        `KONG_PLUGINS=request-transformer,cors,key-auth,acl,basic-auth,request-termination,ip-restriction,post-function`,
        `KONG_NGINX_PROXY_PROXY_BUFFER_SIZE=160k`,
        `KONG_NGINX_PROXY_PROXY_BUFFERS=64 160k`,
        `KONG_PROXY_ACCESS_LOG=/dev/stdout combined`,
        `SUPABASE_ANON_KEY=${anonKey}`,
        `SUPABASE_SERVICE_KEY=${serviceRoleKey}`,
        `DASHBOARD_USERNAME=supabase`,
        `DASHBOARD_PASSWORD=${dashboardPassword}`,
      ].join("\n"),
      source: { type: "image", image: "kong:3.9.1" },
      deploy: { command: "bash /home/kong/kong-entrypoint.sh" },
      domains: [{ host: "$(EASYPANEL_DOMAIN)", port: 8000 }],
      mounts: [
        { type: "file", content: kongYml, mountPath: "/home/kong/temp.yml" },
        {
          type: "file",
          content: kongEntrypointSh,
          mountPath: "/home/kong/kong-entrypoint.sh",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-auth`,
      env: [
        `GOTRUE_API_HOST=0.0.0.0`,
        `GOTRUE_API_PORT=9999`,
        `API_EXTERNAL_URL=${publicUrl}`,
        `GOTRUE_DB_DRIVER=postgres`,
        `GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:${dbPassword}@${host(
          "db"
        )}:5432/postgres`,
        `GOTRUE_SITE_URL=${publicUrl}`,
        `GOTRUE_URI_ALLOW_LIST=`,
        `GOTRUE_DISABLE_SIGNUP=false`,
        `GOTRUE_JWT_ADMIN_ROLES=service_role`,
        `GOTRUE_JWT_AUD=authenticated`,
        `GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated`,
        `GOTRUE_JWT_EXP=3600`,
        `GOTRUE_JWT_SECRET=${jwtSecret}`,
        `GOTRUE_EXTERNAL_EMAIL_ENABLED=true`,
        `GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED=false`,
        `GOTRUE_MAILER_AUTOCONFIRM=false`,
        `GOTRUE_SMTP_ADMIN_EMAIL=admin@example.com`,
        `GOTRUE_SMTP_HOST=`,
        `GOTRUE_SMTP_PORT=2500`,
        `GOTRUE_SMTP_USER=`,
        `GOTRUE_SMTP_PASS=`,
        `GOTRUE_SMTP_SENDER_NAME=`,
        `GOTRUE_MAILER_URLPATHS_INVITE=/auth/v1/verify`,
        `GOTRUE_MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify`,
        `GOTRUE_MAILER_URLPATHS_RECOVERY=/auth/v1/verify`,
        `GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify`,
        `GOTRUE_EXTERNAL_PHONE_ENABLED=true`,
        `GOTRUE_SMS_AUTOCONFIRM=true`,
      ].join("\n"),
      source: { type: "image", image: "supabase/gotrue:v2.186.0" },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-rest`,
      env: [
        `PGRST_DB_URI=postgres://authenticator:${dbPassword}@${host(
          "db"
        )}:5432/postgres`,
        `PGRST_DB_SCHEMAS=public,storage,graphql_public`,
        `PGRST_DB_MAX_ROWS=1000`,
        `PGRST_DB_EXTRA_SEARCH_PATH=public`,
        `PGRST_DB_ANON_ROLE=anon`,
        `PGRST_JWT_SECRET=${jwtSecret}`,
        `PGRST_DB_USE_LEGACY_GUCS=false`,
        `PGRST_APP_SETTINGS_JWT_SECRET=${jwtSecret}`,
        `PGRST_APP_SETTINGS_JWT_EXP=3600`,
      ].join("\n"),
      source: { type: "image", image: "postgrest/postgrest:v14.8" },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-realtime`,
      env: [
        `PORT=4000`,
        `DB_HOST=${host("db")}`,
        `DB_PORT=5432`,
        `DB_USER=supabase_admin`,
        `DB_PASSWORD=${dbPassword}`,
        `DB_NAME=postgres`,
        `DB_AFTER_CONNECT_QUERY=SET search_path TO _realtime`,
        `DB_ENC_KEY=supabaserealtime`,
        `API_JWT_SECRET=${jwtSecret}`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `METRICS_JWT_SECRET=${jwtSecret}`,
        `ERL_AFLAGS=-proto_dist inet_tcp`,
        `DNS_NODES=''`,
        `RLIMIT_NOFILE=10000`,
        `APP_NAME=realtime`,
        `SEED_SELF_HOST=true`,
        `RUN_JANITOR=true`,
        `DISABLE_HEALTHCHECK_LOGGING=true`,
      ].join("\n"),
      source: { type: "image", image: "supabase/realtime:v2.76.5" },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-storage`,
      env: [
        `ANON_KEY=${anonKey}`,
        `SERVICE_KEY=${serviceRoleKey}`,
        `POSTGREST_URL=http://${host("rest")}:3000`,
        `AUTH_JWT_SECRET=${jwtSecret}`,
        `DATABASE_URL=postgres://supabase_storage_admin:${dbPassword}@${host(
          "db"
        )}:5432/postgres`,
        `STORAGE_PUBLIC_URL=${publicUrl}`,
        `REQUEST_ALLOW_X_FORWARDED_PATH=true`,
        `FILE_SIZE_LIMIT=52428800`,
        `STORAGE_BACKEND=file`,
        `GLOBAL_S3_BUCKET=stub`,
        `FILE_STORAGE_BACKEND_PATH=/var/lib/storage`,
        `TENANT_ID=stub`,
        `REGION=stub`,
        `ENABLE_IMAGE_TRANSFORMATION=true`,
        `IMGPROXY_URL=http://${host("imgproxy")}:5001`,
        `S3_PROTOCOL_ACCESS_KEY_ID=${s3AccessKeyId}`,
        `S3_PROTOCOL_ACCESS_KEY_SECRET=${s3AccessKeySecret}`,
      ].join("\n"),
      source: { type: "image", image: "supabase/storage-api:v1.48.26" },
      mounts: [{ type: "volume", name: "data", mountPath: "/var/lib/storage" }],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-imgproxy`,
      env: [
        `IMGPROXY_BIND=:5001`,
        `IMGPROXY_LOCAL_FILESYSTEM_ROOT=/`,
        `IMGPROXY_USE_ETAG=true`,
        `IMGPROXY_AUTO_WEBP=true`,
        `IMGPROXY_MAX_SRC_RESOLUTION=16.8`,
      ].join("\n"),
      source: { type: "image", image: "darthsim/imgproxy:v3.30.1" },
      mounts: [
        {
          type: "bind",
          hostPath: `/etc/easypanel/projects/$(PROJECT_NAME)/${name}-storage/volumes/data`,
          mountPath: "/var/lib/storage",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-meta`,
      env: [
        `PG_META_PORT=8080`,
        `PG_META_DB_HOST=${host("db")}`,
        `PG_META_DB_PORT=5432`,
        `PG_META_DB_NAME=postgres`,
        `PG_META_DB_USER=supabase_admin`,
        `PG_META_DB_PASSWORD=${dbPassword}`,
        `CRYPTO_KEY=${pgMetaCryptoKey}`,
      ].join("\n"),
      source: { type: "image", image: "supabase/postgres-meta:v0.96.3" },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-studio`,
      env: [
        `HOSTNAME=0.0.0.0`,
        `STUDIO_PG_META_URL=http://${host("meta")}:8080`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_HOST=${host("db")}`,
        `POSTGRES_DB=postgres`,
        `POSTGRES_PASSWORD=${dbPassword}`,
        `PG_META_CRYPTO_KEY=${pgMetaCryptoKey}`,
        `PGRST_DB_SCHEMAS=public,storage,graphql_public`,
        `PGRST_DB_MAX_ROWS=1000`,
        `PGRST_DB_EXTRA_SEARCH_PATH=public`,
        `DEFAULT_ORGANIZATION_NAME=Default Organization`,
        `DEFAULT_PROJECT_NAME=Default Project`,
        `SUPABASE_URL=http://${host("kong")}:8000`,
        `SUPABASE_PUBLIC_URL=${publicUrl}`,
        `SUPABASE_ANON_KEY=${anonKey}`,
        `SUPABASE_SERVICE_KEY=${serviceRoleKey}`,
        `AUTH_JWT_SECRET=${jwtSecret}`,
        `LOGFLARE_API_KEY=${logflarePublicToken}`,
        `LOGFLARE_PUBLIC_ACCESS_TOKEN=${logflarePublicToken}`,
        `LOGFLARE_PRIVATE_ACCESS_TOKEN=${logflarePrivateToken}`,
        `LOGFLARE_URL=http://${host("analytics")}:4000`,
        `NEXT_PUBLIC_ENABLE_LOGS=true`,
        `NEXT_ANALYTICS_BACKEND_PROVIDER=postgres`,
      ].join("\n"),
      source: {
        type: "image",
        image: "supabase/studio:2026.04.27-sha-5f60601",
      },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-functions`,
      env: [
        `JWT_SECRET=${jwtSecret}`,
        `SUPABASE_URL=http://${host("kong")}:8000`,
        `SUPABASE_PUBLIC_URL=${publicUrl}`,
        `SUPABASE_ANON_KEY=${anonKey}`,
        `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`,
        `SUPABASE_DB_URL=postgresql://postgres:${dbPassword}@${host(
          "db"
        )}:5432/postgres`,
        `VERIFY_JWT=false`,
      ].join("\n"),
      source: { type: "image", image: "supabase/edge-runtime:v1.71.2" },
      deploy: {
        command: "edge-runtime start --main-service /home/deno/functions/main",
      },
      mounts: [
        {
          type: "file",
          content: `Deno.serve(() => new Response("ok"));\n`,
          mountPath: "/home/deno/functions/main/index.ts",
        },
        { type: "volume", name: "cache", mountPath: "/root/.cache/deno" },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-analytics`,
      env: [
        `LOGFLARE_NODE_HOST=127.0.0.1`,
        `DB_USERNAME=supabase_admin`,
        `DB_DATABASE=_supabase`,
        `DB_HOSTNAME=${host("db")}`,
        `DB_PORT=5432`,
        `DB_PASSWORD=${dbPassword}`,
        `DB_SCHEMA=_analytics`,
        `LOGFLARE_PUBLIC_ACCESS_TOKEN=${logflarePublicToken}`,
        `LOGFLARE_PRIVATE_ACCESS_TOKEN=${logflarePrivateToken}`,
        `LOGFLARE_SINGLE_TENANT=true`,
        `LOGFLARE_SUPABASE_MODE=true`,
        `POSTGRES_BACKEND_URL=postgresql://supabase_admin:${dbPassword}@${host(
          "db"
        )}:5432/_supabase`,
        `POSTGRES_BACKEND_SCHEMA=_analytics`,
        `LOGFLARE_FEATURE_FLAG_OVERRIDE=multibackend=true`,
      ].join("\n"),
      source: { type: "image", image: "supabase/logflare:1.36.1" },
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-vector`,
      env: [`LOGFLARE_PUBLIC_ACCESS_TOKEN=${logflarePublicToken}`].join("\n"),
      source: { type: "image", image: "timberio/vector:0.53.0-alpine" },
      deploy: {
        command: "/usr/local/bin/vector --config /etc/vector/vector.yml",
      },
      mounts: [
        {
          type: "file",
          content: vectorYml,
          mountPath: "/etc/vector/vector.yml",
        },
        {
          type: "bind",
          hostPath: "/var/run/docker.sock",
          mountPath: "/var/run/docker.sock",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: `${name}-supavisor`,
      env: [
        `PORT=4000`,
        `POSTGRES_PORT=5432`,
        `POSTGRES_HOST=${host("db")}`,
        `POSTGRES_DB=postgres`,
        `POSTGRES_PASSWORD=${dbPassword}`,
        `DATABASE_URL=ecto://supabase_admin:${dbPassword}@${host(
          "db"
        )}:5432/_supabase`,
        `CLUSTER_POSTGRES=true`,
        `SECRET_KEY_BASE=${secretKeyBase}`,
        `VAULT_ENC_KEY=${vaultEncKey}`,
        `API_JWT_SECRET=${jwtSecret}`,
        `METRICS_JWT_SECRET=${jwtSecret}`,
        `REGION=local`,
        `ERL_AFLAGS=-proto_dist inet_tcp`,
        `POOLER_TENANT_ID=${poolerTenantId}`,
        `POOLER_DEFAULT_POOL_SIZE=20`,
        `POOLER_MAX_CLIENT_CONN=100`,
        `POOLER_POOL_MODE=transaction`,
        `DB_POOL_SIZE=5`,
      ].join("\n"),
      source: { type: "image", image: "supabase/supavisor:2.7.4" },
      deploy: {
        command:
          '/app/bin/migrate && /app/bin/supavisor eval "$(cat /etc/pooler/pooler.exs)" && /app/bin/server',
      },
      mounts: [
        {
          type: "file",
          content: poolerExs,
          mountPath: "/etc/pooler/pooler.exs",
        },
      ],
    },
  });

  return { services };
}
