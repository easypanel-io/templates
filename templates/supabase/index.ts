import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
    const services: Services = [];
    const databasePassword = randomPassword();
    const databaseUsername = 'postgres';

    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.studioServiceName,
            source: {
                type: 'image',
                image: 'supabase/studio:latest',
            },
            ports: [
                {
                    published: 3000,
                    target: 3000,
                },
            ],
            env: [
                `STUDIO_PG_META_URL=http://meta:8080`,
                `POSTGRES_PASSWORD=${databasePassword}`,
                `SUPABASE_URL=http://kong:8000`,
                `SUPABASE_REST_URL=${PUBLIC_REST_URL}`,
                `SUPABASE_ANON_KEY=${ANON_KEY}`,
                `SUPABASE_SERVICE_KEY=${SERVICE_ROLE_KEY}`,
            ].join('\n'),
        },
    });

    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.kongServiceName,
            source: {
                type: 'image',
                image: 'kong:2.1',
            },
            ports: [
                {
                    published: 8000,
                    target: 8000,
                },
                {
                    published: 8000,
                    target: 8443,
                },
            ],
            env: [
                `KONG_DATABASE=off`,
                `KONG_DECLARATIVE_CONFIG=/var/lib/kong/kong.yml`,
                `KONG_DNS_ORDER=LAST,A,CNAME`,
                `KONG_PLUGINS=request-transformer,cors,key-auth,acl`,
            ].join('\n'),
            mounts: [
                {
                    type: 'bind',
                    hostPath: './volumes/api',
                    mountPath: '/var/lib/kong',
                },
            ],
        },
    });
    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.authServiceName,
            source: {
                type: 'image',
                image: 'supabase/gotrue:v2.10.0',
            },
            env: [
                `GOTRUE_API_HOST=0.0.0.0`,
                `GOTRUE_API_PORT=9999`,
                `API_EXTERNAL_URL=${API_EXTERNAL_URL}`,
                `GOTRUE_DB_DRIVER=postgres`,
                `GOTRUE_DB_DATABASE_URL=postgres://${databaseUsername}:${databasePassword}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?search_path=auth`,
                `GOTRUE_SITE_URL=${SITE_URL}`,
                `GOTRUE_URI_ALLOW_LIST=${ADDITIONAL_REDIRECT_URLS}`,
                `GOTRUE_DISABLE_SIGNUP=${DISABLE_SIGNUP}`,
                `GOTRUE_JWT_ADMIN_ROLES=service_role`,
                `GOTRUE_JWT_AUD=authenticated`,
                `GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated`,
                `GOTRUE_JWT_EXP=${JWT_EXPIRY}`,
                `GOTRUE_JWT_SECRET=${JWT_SECRET}`,
                `GOTRUE_EXTERNAL_EMAIL_ENABLED=${ENABLE_EMAIL_SIGNUP}`,
                `GOTRUE_MAILER_AUTOCONFIRM=${ENABLE_EMAIL_AUTOCONFIRM}`,
                `GOTRUE_SMTP_ADMIN_EMAIL=${SMTP_ADMIN_EMAIL}`,
                `GOTRUE_SMTP_HOST=${SMTP_HOST}`,
                `GOTRUE_SMTP_PORT=${SMTP_PORT}`,
                `GOTRUE_SMTP_USER=${SMTP_USER}`,
                `GOTRUE_SMTP_PASS=${SMTP_PASS}`,
                `GOTRUE_SMTP_SENDER_NAME=${SMTP_SENDER_NAME}`,
                `GOTRUE_MAILER_URLPATHS_INVITE=${MAILER_URLPATHS_INVITE}`,
                `GOTRUE_MAILER_URLPATHS_CONFIRMATION=${MAILER_URLPATHS_CONFIRMATION}`,
                `GOTRUE_MAILER_URLPATHS_RECOVERY=${MAILER_URLPATHS_RECOVERY}`,
                `GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE=${MAILER_URLPATHS_EMAIL_CHANGE}`,
                `GOTRUE_EXTERNAL_PHONE_ENABLED=${ENABLE_PHONE_SIGNUP}`,
                `GOTRUE_SMS_AUTOCONFIRM=${ENABLE_PHONE_AUTOCONFIRM}`,
            ].join('\n'),
        },
    });
    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.restServiceName,
            source: {
                type: 'image',
                image: 'postgrest/postgrest:v9.0.1',
            },
            env: [
                `PGRST_DB_URI=postgres://${databaseUsername}:${databasePassword}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
                `PGRST_DB_SCHEMAS=${PGRST_DB_SCHEMAS}`,
                `PGRST_DB_ANON_ROLE=anon`,
                `PGRST_JWT_SECRET=${JWT_SECRET}`,
                `PGRST_DB_USE_LEGACY_GUCS=false`,
            ].join('\n'),
        },
    });
    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.realtimeServiceName,
            source: {
                type: 'image',
                image: 'supabase/realtime:v0.22.4',
            },
            deploy: {
                command:
                    'bash -c "./prod/rel/realtime/bin/realtime eval Realtime.Release.migrate && ./prod/rel/realtime/bin/realtime start"\n',
            },
            env: [
                `DB_HOST=${POSTGRES_HOST}`,
                `DB_PORT=${POSTGRES_PORT}`,
                `DB_NAME=${POSTGRES_DB}`,
                `DB_USER=${databaseUsername}`,
                `DB_PASSWORD=${databasePassword}`,
                `DB_SSL=false`,
                `PORT=4000`,
                `JWT_SECRET=${JWT_SECRET}`,
                `REPLICATION_MODE=RLS`,
                `REPLICATION_POLL_INTERVAL=100`,
                `SECURE_CHANNELS=true`,
                `SLOT_NAME=supabase_realtime_rls`,
                `TEMPORARY_SLOT=true`,
            ].join('\n'),
        },
    });
    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.storageServiceName,
            source: {
                type: 'image',
                image: 'supabase/storage-api:v0.10.0-rest',
            },
            env: [
                `ANON_KEY=${ANON_KEY}`,
                `SERVICE_KEY=${SERVICE_ROLE_KEY}`,
                `POSTGREST_URL=http://rest:3000`,
                `PGRST_JWT_SECRET=${JWT_SECRET}`,
                `DATABASE_URL=postgres://${databaseUsername}:${databasePassword}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`,
                `PGOPTIONS=-c search_path=storage,public`,
                `FILE_SIZE_LIMIT=52428800`,
                `STORAGE_BACKEND=file`,
                `FILE_STORAGE_BACKEND_PATH=/var/lib/storage`,
                `TENANT_ID=stub`,
                `REGION=stub`,
                `GLOBAL_S3_BUCKET=stub`,
            ].join('\n'),

            mounts: [
                {
                    type: 'bind',
                    hostPath: './volumes/storage',
                    mountPath: '/var/lib/storage',
                },
            ],
        },
    });
    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.metaDatabaseServiceName,
            source: {
                type: 'image',
                image: 'supabase/postgres-meta:v0.29.0',
            },
            env: [
                `PG_META_PORT=8080`,
                `PG_META_DB_HOST=${POSTGRES_HOST}`,
                `PG_META_DB_PORT=${POSTGRES_PORT}`,
                `PG_META_DB_NAME=${POSTGRES_DB}`,
                `PG_META_DB_USER=${databaseUsername}`,
                `PG_META_DB_PASSWORD=${databasePassword}`,
            ].join('\n'),
        },
    });
    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.databaseServiceName,
            source: {
                type: 'image',
                image: 'supabase/postgres:14.1.0.21',
            },
            deploy: {
                command:
                    'postgres -c config_file=/etc/postgresql/postgresql.conf',
            },
            ports: [
                {
                    published: 5432,
                    target: 5432,
                },
            ],
            env: [`POSTGRES_PASSWORD=${databasePassword}`].join('\n'),

            mounts: [
                {
                    type: 'bind',
                    hostPath: './volumes/db/init',
                    mountPath: '/docker-entrypoint-initdb.d',
                },
            ],
        },
    });

    return { services };
}