import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

const SCHEMA_SQL = `-- OxiCloud Unified Database Schema
CREATE SCHEMA IF NOT EXISTS auth;
DO $BODY$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace WHERE t.typname = 'userrole' AND n.nspname = 'auth') THEN
 CREATE TYPE auth.userrole AS ENUM ('admin', 'user');
 END IF;
END $BODY$;
CREATE TABLE IF NOT EXISTS auth.users (id VARCHAR(36) PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role auth.userrole NOT NULL, storage_quota_bytes BIGINT NOT NULL DEFAULT 10737418240, storage_used_bytes BIGINT NOT NULL DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, last_login_at TIMESTAMP WITH TIME ZONE, active BOOLEAN NOT NULL DEFAULT TRUE);
CREATE INDEX IF NOT EXISTS idx_users_username ON auth.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE TABLE IF NOT EXISTS auth.sessions (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, refresh_token TEXT NOT NULL UNIQUE, expires_at TIMESTAMP WITH TIME ZONE NOT NULL, ip_address TEXT, user_agent TEXT, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, revoked BOOLEAN NOT NULL DEFAULT FALSE);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_refresh_token ON auth.sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth.sessions(expires_at);
CREATE OR REPLACE FUNCTION auth.is_session_active(expires_at timestamptz) RETURNS boolean AS $$ BEGIN RETURN expires_at > now(); END; $$ LANGUAGE plpgsql IMMUTABLE;
CREATE INDEX IF NOT EXISTS idx_sessions_active ON auth.sessions(user_id, revoked) WHERE NOT revoked AND auth.is_session_active(expires_at);
CREATE TABLE IF NOT EXISTS auth.user_files (id SERIAL PRIMARY KEY, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, file_path TEXT NOT NULL, file_id TEXT NOT NULL, size_bytes BIGINT NOT NULL DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, file_path));
CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON auth.user_files(user_id);
CREATE INDEX IF NOT EXISTS idx_user_files_file_id ON auth.user_files(file_id);
CREATE TABLE IF NOT EXISTS auth.user_favorites (id SERIAL PRIMARY KEY, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, item_id TEXT NOT NULL, item_type TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, item_id, item_type));
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON auth.user_favorites(user_id);
CREATE TABLE IF NOT EXISTS auth.user_recent_files (id SERIAL PRIMARY KEY, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, item_id TEXT NOT NULL, item_type TEXT NOT NULL, accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(user_id, item_id, item_type));
CREATE TABLE IF NOT EXISTS auth.admin_settings (key VARCHAR(255) PRIMARY KEY, value TEXT NOT NULL, category VARCHAR(50) NOT NULL DEFAULT 'general', is_secret BOOLEAN NOT NULL DEFAULT FALSE, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_by VARCHAR(36));
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS oidc_provider VARCHAR(255);
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS oidc_subject VARCHAR(255);
CREATE SCHEMA IF NOT EXISTS caldav;
CREATE TABLE IF NOT EXISTS caldav.calendars (id UUID PRIMARY KEY, name TEXT NOT NULL, owner_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, description TEXT, color VARCHAR(9), is_public BOOLEAN NOT NULL DEFAULT FALSE, ctag VARCHAR(64) NOT NULL DEFAULT '0', created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS caldav.calendar_events (id UUID PRIMARY KEY, calendar_id UUID NOT NULL REFERENCES caldav.calendars(id) ON DELETE CASCADE, summary TEXT NOT NULL, description TEXT, location TEXT, start_time TIMESTAMP WITH TIME ZONE NOT NULL, end_time TIMESTAMP WITH TIME ZONE NOT NULL, all_day BOOLEAN NOT NULL DEFAULT FALSE, rrule TEXT, ical_uid VARCHAR(255) NOT NULL, ical_data TEXT, etag VARCHAR(64), created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS caldav.calendar_shares (id SERIAL PRIMARY KEY, calendar_id UUID NOT NULL REFERENCES caldav.calendars(id) ON DELETE CASCADE, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, access_level VARCHAR(10) NOT NULL DEFAULT 'read', created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(calendar_id, user_id));
CREATE TABLE IF NOT EXISTS caldav.calendar_properties (id SERIAL PRIMARY KEY, calendar_id UUID NOT NULL REFERENCES caldav.calendars(id) ON DELETE CASCADE, property_name TEXT NOT NULL, property_value TEXT NOT NULL, UNIQUE(calendar_id, property_name));
CREATE SCHEMA IF NOT EXISTS carddav;
CREATE TABLE IF NOT EXISTS carddav.address_books (id UUID PRIMARY KEY, name TEXT NOT NULL, owner_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, description TEXT, color VARCHAR(9), is_public BOOLEAN NOT NULL DEFAULT FALSE, ctag VARCHAR(64) NOT NULL DEFAULT '0', created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS carddav.contacts (id UUID PRIMARY KEY, address_book_id UUID NOT NULL REFERENCES carddav.address_books(id) ON DELETE CASCADE, uid VARCHAR(255) NOT NULL, full_name TEXT, first_name TEXT, last_name TEXT, nickname TEXT, organization TEXT, title TEXT, notes TEXT, photo_url TEXT, birthday DATE, anniversary DATE, email JSONB NOT NULL DEFAULT '[]', phone JSONB NOT NULL DEFAULT '[]', address JSONB NOT NULL DEFAULT '[]', vcard TEXT, etag VARCHAR(64) NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS carddav.address_book_shares (id SERIAL PRIMARY KEY, address_book_id UUID NOT NULL REFERENCES carddav.address_books(id) ON DELETE CASCADE, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, can_write BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(address_book_id, user_id));
CREATE TABLE IF NOT EXISTS carddav.contact_groups (id UUID PRIMARY KEY, address_book_id UUID NOT NULL REFERENCES carddav.address_books(id) ON DELETE CASCADE, name TEXT NOT NULL, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS carddav.group_memberships (id SERIAL PRIMARY KEY, group_id UUID NOT NULL REFERENCES carddav.contact_groups(id) ON DELETE CASCADE, contact_id UUID NOT NULL REFERENCES carddav.contacts(id) ON DELETE CASCADE, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(group_id, contact_id));
CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.blobs (hash VARCHAR(64) PRIMARY KEY, size BIGINT NOT NULL, ref_count INTEGER NOT NULL DEFAULT 1 CHECK (ref_count >= 0), content_type TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS storage.folders (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, parent_id UUID REFERENCES storage.folders(id) ON DELETE CASCADE, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, is_trashed BOOLEAN NOT NULL DEFAULT FALSE, trashed_at TIMESTAMP WITH TIME ZONE, original_parent_id UUID, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS storage.files (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, folder_id UUID REFERENCES storage.folders(id) ON DELETE SET NULL, user_id VARCHAR(36) NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, blob_hash VARCHAR(64) NOT NULL, size BIGINT NOT NULL DEFAULT 0, mime_type TEXT NOT NULL DEFAULT 'application/octet-stream', is_trashed BOOLEAN NOT NULL DEFAULT FALSE, trashed_at TIMESTAMP WITH TIME ZONE, original_folder_id UUID, created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON storage.folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON storage.folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON storage.files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON storage.files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_blob_hash ON storage.files(blob_hash);
CREATE OR REPLACE VIEW storage.trash_items AS SELECT id, name, 'file' AS item_type, user_id, trashed_at, original_folder_id AS original_parent_id, created_at FROM storage.files WHERE is_trashed = TRUE UNION ALL SELECT id, name, 'folder' AS item_type, user_id, trashed_at, original_parent_id, created_at FROM storage.folders WHERE is_trashed = TRUE;
`;

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();

  const dbConnectionString = `postgres://postgres:${databasePassword}@$(PROJECT_NAME)_${input.appServiceName}-db:5432/oxicloud`;

  services.push({
    type: "app",
    data: {
      serviceName: `${input.appServiceName}-db`,
      source: {
        type: "image",
        image: input.databaseImage,
      },
      env: [
        `POSTGRES_USER=postgres`,
        `POSTGRES_PASSWORD=${databasePassword}`,
        `POSTGRES_DB=oxicloud`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "pg_data",
          mountPath: "/var/lib/postgresql/data",
        },
        {
          type: "file",
          content: SCHEMA_SQL,
          mountPath: "/docker-entrypoint-initdb.d/10-schema.sql",
        },
      ],
    },
  });

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 8086,
        },
      ],
      env: [
        `OXICLOUD_DB_CONNECTION_STRING=${dbConnectionString}`,
        `DATABASE_URL=${dbConnectionString}`,
      ].join("\n"),
      mounts: [
        {
          type: "volume",
          name: "storage_data",
          mountPath: "/app/storage",
        },
      ],
    },
  });

  return { services };
}
