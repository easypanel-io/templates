import { Output, randomPassword, randomString, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
    const services: Services = [];
    const databasePassword = randomPassword();
    const databaseUsername = 'postgres';
    const ANON_KEY = randomString(32);
    const SERVICE_ROLE_KEY = randomString(32);
    const JWT_SECRET = randomString(32);

    services.push({
        type: 'app',
        data: {
            projectName: input.projectName,
            serviceName: input.studioServiceName,
            source: {
                type: 'image',
                image: 'supabase/studio:20221214-4eecc99',
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
                `SUPABASE_URL=http://${input.kongServiceName}8000`,
                `SUPABASE_REST_URL=$http://${input.restServiceName}`,
                `SUPABASE_ANON_KEY=${ANON_KEY}`,
                `SUPABASE_SERVICE_KEY=${SERVICE_ROLE_KEY}`,
                `STUDIO_PORT=3000`
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
                `API_EXTERNAL_URL=${input.kongServiceName}:8000`,
                `GOTRUE_DB_DRIVER=postgres`,
                `GOTRUE_DB_DATABASE_URL=postgres://${databaseUsername}:${databasePassword}@${input.projectName}_${input.databaseServiceName}:5432/${input.projectName}?search_path=auth`,
                `GOTRUE_SITE_URL=${input.restServiceName}:3000`,
                `GOTRUE_URI_ALLOW_LIST=https://${input.restServiceName}:3000`,
                `GOTRUE_DISABLE_SIGNUP=false`,
                `GOTRUE_JWT_ADMIN_ROLES=service_role`,
                `GOTRUE_JWT_AUD=authenticated`,
                `GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated`,
                `GOTRUE_JWT_EXP=16000`,
                `GOTRUE_JWT_SECRET=${JWT_SECRET}`,
                `GOTRUE_EXTERNAL_EMAIL_ENABLED=false`,
                `GOTRUE_MAILER_AUTOCONFIRM=false`,
                `GOTRUE_SMTP_ADMIN_EMAIL=false`,
                `GOTRUE_SMTP_HOST=`,
                `GOTRUE_SMTP_PORT=`,
                `GOTRUE_SMTP_USER=`,
                `GOTRUE_SMTP_PASS=`,
                `GOTRUE_SMTP_SENDER_NAME=`,
                `GOTRUE_MAILER_URLPATHS_INVITE=false`,
                `GOTRUE_MAILER_URLPATHS_CONFIRMATION=false`,
                `GOTRUE_MAILER_URLPATHS_RECOVERY=false`,
                `GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE=false`,
                `GOTRUE_EXTERNAL_PHONE_ENABLED=false`,
                `GOTRUE_SMS_AUTOCONFIRM=false`,
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
                `PGRST_DB_URI=postgres://${databaseUsername}:${databasePassword}@${input.projectName}_${input.metaDatabaseServiceName}:5432/${input.projectName}`,
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
                `DB_HOST=${input.projectName}_${input.metaDatabaseServiceName}`,
                `DB_PORT=5432`,
                `DB_NAME=${input.projectName}`,
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
                `DATABASE_URL=postgres://${databaseUsername}:${databasePassword}@$${input.projectName}_${input.databaseServiceName}/${input.projectName}`,
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
                `PG_META_DB_HOST=${input.projectName}_${input.databaseServiceName}`,
                `PG_META_DB_PORT=5432`,
                `PG_META_DB_NAME=${input.projectName}`,
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