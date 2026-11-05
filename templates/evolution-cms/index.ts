import { Output, randomPassword, Services } from "~templates-utils";
import { Input } from "./meta";

const webRoot = "/var/www/html";
const sqliteDatabase = "sqlite/evolution";

// One volume per path that outlives the code on the "core" volume. Evolution CMS
// updates by laying a new tree over the site, so these are written through, never
// replaced. Real mounts rather than symlinks: the file managers refuse links.
const drives: [name: string, path: string][] = [
  ["core", ""],
  ["custom", "core/custom"],
  ["storage", "core/storage"],
  ["plugins", "assets/plugins"],
  ["snippets", "assets/snippets"],
  ["modules", "assets/modules"],
  ["tvs", "assets/tvs"],
  ["templates", "assets/templates"],
  ["views", "views"],
  ["images", "assets/images"],
  ["files", "assets/files"],
  ["media", "assets/media"],
  ["backup", "assets/backup"],
];

// What an administrator bumps for security fixes. The base images stay pinned, so a
// plain deploy rebuilds nothing: these lines are the switch, kept last in the Dockerfile
// so that changing one repeats only the last layer.
const nginxVersion = "1.30.6";
const frankenphpVersion = "1.13.4";
const securityUpdates = "2026-11-04";
const composerImage = "composer:2.11.1";

const refreshNote = `# Set to any new value and deploy to install the current security fixes of the system.
ARG SECURITY_UPDATES=${securityUpdates}`;

const phpExtensions = "gd zip exif intl mysqli pdo_mysql pdo_pgsql";

const coreDockerfile = (image: string) => `FROM ${image}
COPY --from=${composerImage} /usr/bin/composer /usr/local/bin/composer
RUN apt-get update \\
    && apt-get install -y --no-install-recommends \\
        git unzip procps libfreetype6-dev libjpeg62-turbo-dev libpng-dev libwebp-dev \\
        libzip-dev libpq-dev libicu-dev \\
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \\
    && docker-php-ext-install -j"$(nproc)" ${phpExtensions} \\
    && rm -rf /var/lib/apt/lists/*
`;

const apacheDockerfile = (php: string) => `${coreDockerfile(
  `php:${php}-apache`
)}RUN a2enmod rewrite headers expires
${refreshNote}
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
`;

const nginxDockerfile = (php: string) => `${coreDockerfile(
  `php:${php}-fpm`
)}# A version of nginx.org/packages, set it and deploy. A wrong one fails the build and the site keeps running.
ARG NGINX_VERSION=${nginxVersion}
${refreshNote}
RUN . /etc/os-release \\
    && curl -fsSL https://nginx.org/keys/nginx_signing.key -o /usr/share/keyrings/nginx.asc \\
    && echo "deb [signed-by=/usr/share/keyrings/nginx.asc] https://nginx.org/packages/debian $VERSION_CODENAME nginx" \\
        > /etc/apt/sources.list.d/nginx.list \\
    && apt-get update && apt-get upgrade -y \\
    && apt-get install -y --no-install-recommends --allow-downgrades "nginx=$NGINX_VERSION-1~$VERSION_CODENAME" \\
    && rm -f /etc/nginx/conf.d/default.conf \\
    && sed -i 's/^user .*/user www-data;/' /etc/nginx/nginx.conf \\
    && ln -sf /dev/stdout /var/log/nginx/access.log \\
    && ln -sf /dev/stderr /var/log/nginx/error.log \\
    && rm -rf /var/lib/apt/lists/*
`;

// The tag carries both versions: FrankenPHP embeds Caddy and PHP in one binary.
const frankenphpDockerfile = (
  php: string
) => `FROM dunglas/frankenphp:${frankenphpVersion}-php${php}
# The check of this image needs Caddy up: it would keep traffic away for 30 seconds after each
# start, and kill a container whose boot, an update for one, takes longer than a minute and a half.
HEALTHCHECK NONE
COPY --from=${composerImage} /usr/bin/composer /usr/local/bin/composer
RUN install-php-extensions ${phpExtensions} \\
    && apt-get update \\
    && apt-get install -y --no-install-recommends git unzip curl procps libcap2-bin \\
    && setcap CAP_NET_BIND_SERVICE=+eip /usr/local/bin/frankenphp \\
    && chown -R www-data:www-data /config/caddy /data/caddy \\
    && rm -rf /var/lib/apt/lists/*
${refreshNote}
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*
`;

// ng.inx of the CMS without TLS, which Traefik terminates. PHP stays an allowlist of
// entry points, and every deny comes before the handler: regex locations go in order.
const nginxConfig = String.raw`map $http_x_forwarded_proto $evo_https {
    default "";
    https on;
}

map $uri $evo_installer_auth {
    default off;
    ~^/install(/|$) "Evolution CMS installer";
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root ${webRoot};
    index index.php index.html;
    server_tokens off;
    autoindex off;
    client_max_body_size 100M;
    error_page 404 /index.php?q=404;

    # SAMEORIGIN, not DENY: the manager is a frameset.
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    include /etc/nginx/evo-installer.conf;

    location ^~ /.well-known/ { allow all; }
    location ~ (^|/)\. { return 404; }
    location ~ ^/(core|views|vendor|tmp)(/|$) { return 404; }
    location ~* ^/assets/cache/images/.+\.(jpe?g|png|gif|webp|avif|bmp|ico|wbmp)$ { expires max; }
    location ~ ^/assets/(cache|backup|export|import)(/|$) { return 404; }
    location ~ ^/(composer\.(json|lock)|phpstan\.neon|publiccode\.yml|AGENTS\.md|README\.md|ht\.access|ng\.inx|config\.php(\.example)?)$ { return 404; }
    location ~* \.(sql|sqlite|db|log|bak|old|orig|save|swp|swo|tpl|inc|ini|env|dist|example|yml|yaml|lock|tar)(\.(gz|bz2|xz|zip|tgz))?$ { return 404; }
    location ~ ^/assets/.*\.php$ { return 404; }

    location / { try_files $uri $uri/ @rewrite; }

    location ~ ^/(index\.php|update\.php|install/index\.php|manager/(index\.php|captcha\.php|processors/remove_installer\.processor\.php|includes/session_keepalive\.php|media/style/[A-Za-z0-9_-]+/ajax\.php|media/browser/[A-Za-z0-9_-]+/(browse|browser|css|js_localize)\.php|media/browser/[A-Za-z0-9_-]+/js/browser/joiner\.php))$ {
        try_files $uri @rewrite;
        include /etc/nginx/fastcgi_params;
        fastcgi_param SERVER_NAME $host;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param HTTPS $evo_https if_not_empty;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 300;
        fastcgi_pass 127.0.0.1:9000;
    }

    location ~* ^/manager/.+\.(css|js|html|txt|jpg|jpeg|gif|png|webp|svg|ico|bmp|swf|woff|woff2|ttf|otf|eot)$ { expires max; }
    location /manager { rewrite ^/manager/(.*)$ /manager/index.php last; }
    location ~ \.php$ { return 404; }
    location ~* \.(css|js|html|txt|xml|rss|atom|jpg|jpeg|gif|png|webp|avif|svg|svgz|ico|bmp|swf|woff|woff2|ttf|otf|eot|mp3|mp4|webm|ogg|ogv|wav|pdf|zip|gz)$ { expires max; }
    location @rewrite { rewrite ^(.*)$ /index.php?q=$1&$args last; }
}
`.replace("${webRoot}", webRoot);

// clear_env: the CMS reads DB_* from the environment, which FPM hides by default.
const fpmPool = `[www]
listen = 127.0.0.1:9000
clear_env = no
pm.max_children = 20
`;

// The rules of .github/docker/worker.Caddyfile of the CMS. route pins them to this order.
// The .htaccess of a site stays the one its first release laid, whatever the updates bring.
const apacheRules = String.raw`RedirectMatch 404 "/\.(?!well-known/)"
RedirectMatch 404 "^/(core|views|vendor|tmp)(/|$)"
RedirectMatch 404 "^/assets/(?!cache/images/.+\.(?i:jpe?g|png|gif|webp|avif|bmp|ico|wbmp)$)(cache|backup|export|import)(/|$)"
RedirectMatch 404 "^/(composer\.(json|lock)|phpstan\.neon|publiccode\.yml|AGENTS\.md|README\.md|ht\.access|ng\.inx|config\.php(\.example)?)$"
RedirectMatch 404 "(?i)\.(sql|sqlite|db|log|bak|old|orig|save|swp|swo|tpl|inc|ini|env|dist|example|yml|yaml|lock|tar)(\.(gz|bz2|xz|zip|tgz))?$"
RedirectMatch 404 "(?i)^/assets/.*\.php(/|$)"
`;

const caddyfile = String.raw`{
    auto_https off
    frankenphp {
        import /tmp/evo-worker.caddy
    }
}

:80 {
    root * ${webRoot}
    encode zstd gzip

    route {
        @installer path /install /install/*
        import /tmp/evo-installer.caddy

        @private path_regexp private (?i)^/(core|views|vendor|tmp)(/|$)|^/(composer\.(json|lock)|phpstan\.neon|publiccode\.yml|AGENTS\.md|README\.md|ht\.access|ng\.inx|config\.php(\.example)?)$
        respond @private 404
        @dotfiles {
            path_regexp dotfiles (^|/)\.
            not path /.well-known/*
        }
        respond @dotfiles 404
        @fragments path_regexp fragments (?i)\.(sql|sqlite|db|log|bak|old|orig|save|swp|swo|tpl|inc|ini|env|dist|example|yml|yaml|lock|tar)(\.(gz|bz2|xz|zip|tgz))?$
        respond @fragments 404
        @assetScripts path_regexp assetScripts (?i)^/assets/.*\.php(?:/|$)
        respond @assetScripts 404
        @generated {
            path /assets/cache /assets/cache/* /assets/backup /assets/backup/* /assets/export /assets/export/* /assets/import /assets/import/*
            not {
                path_regexp thumbnails (?i)^/assets/cache/images/.*\.(jpe?g|png|gif|webp|avif|bmp|ico|wbmp)$
                file
            }
        }
        respond @generated 404

        @notfile {
            not file {
                try_files {path} {path}/index.php {path}/index.html
            }
        }
        rewrite @notfile /index.php?q={path}&{query}

        php_server
    }
}
`.replace("${webRoot}", webRoot);

type Server = {
  dockerfile: (php: string) => string;
  // Where the installer rule goes, and the rule for each state of the flag.
  ruleFile: string;
  closedRule: string;
  openRule: string;
  version: string;
  start: string;
  mounts: { content: string; mountPath: string }[];
};

const servers: Record<string, Server> = {
  apache: {
    dockerfile: apacheDockerfile,
    ruleFile: "/etc/apache2/conf-enabled/evo-installer.conf",
    closedRule: `RedirectMatch 404 "^/install(/|$)"`,
    openRule: `<LocationMatch "^/install(/|$)">
    AuthType Basic
    AuthName "Evolution CMS installer"
    AuthUserFile /tmp/evo-installer.htpasswd
    Require valid-user
</LocationMatch>`,
    version: "apache2 -v | head -1",
    start: "exec docker-php-entrypoint apache2-foreground",
    mounts: [
      {
        content: apacheRules,
        mountPath: "/etc/apache2/conf-enabled/evo-private.conf",
      },
    ],
  },
  nginx: {
    dockerfile: nginxDockerfile,
    ruleFile: "/etc/nginx/evo-installer.conf",
    closedRule: "location ~ ^/install(/|$) { return 404; }",
    openRule: `auth_basic $evo_installer_auth;
auth_basic_user_file /tmp/evo-installer.htpasswd;`,
    version: "nginx -v 2>&1",
    start: `# The master of FPM rarely dies, and a site without it answers only 502.
(
    while true; do
        php-fpm --nodaemonize || true
        log "php-fpm exited, restarting in a second"
        sleep 1
    done
) &
exec nginx -g 'daemon off;'`,
    mounts: [
      { content: nginxConfig, mountPath: "/etc/nginx/conf.d/evolution.conf" },
      {
        content: fpmPool,
        mountPath: "/usr/local/etc/php-fpm.d/zz-evolution.conf",
      },
    ],
  },
  frankenphp: {
    dockerfile: frankenphpDockerfile,
    ruleFile: "/tmp/evo-installer.caddy",
    closedRule: "respond @installer 404",
    openRule: `basic_auth @installer {
    install {$EVO_INSTALL_HASH}
}`,
    version: "frankenphp version",
    // PHP runs inside this process, and nothing else would drop root.
    start: `exec setpriv --reuid=www-data --regid=www-data --init-groups \\
    frankenphp run --config /etc/evolution/Caddyfile --adapter caddyfile`,
    mounts: [{ content: caddyfile, mountPath: "/etc/evolution/Caddyfile" }],
  },
};

const phpIni = `upload_max_filesize = 100M
post_max_size = 100M
memory_limit = 256M
variables_order = EGPCS
`;

// Workers keep the code they loaded: the manager, which updates the core and the plugins
// without a restart, would otherwise leave them on the old code next to a new database.
const workerSetup = (server: Server) =>
  server !== servers.frankenphp
    ? ""
    : `
: > /tmp/evo-worker.caddy
workers=
if [ "\${EVO_WORKER_MODE:-0}" = 1 ]; then
    if [ ! -f "$APP/core/.install" ]; then
        log "worker mode starts with the first deploy after the install"
    elif [ ! -f "$APP/core/includes/worker.runtime.php" ]; then
        log "this version of the CMS has no worker mode, serving in classic mode"
    else
        workers=1
        echo 'worker ${webRoot}/index.php {$EVO_WORKER_COUNT:2}' > /tmp/evo-worker.caddy
        log "worker mode on, origin $EVO_WORKER_ORIGIN, kept app \${EVO_WORKER_KEEP_APP:-0}"
    fi
fi
touch /tmp/evo-code-stamp
restart_workers() {
    [ -n "$workers" ] && ! busy || return 0
    # Stamped before the search and kept only after the restart, so no change is lost.
    touch /tmp/evo-code-next
    changed=$(find "$APP/core/factory/version.php" "$APP/core/vendor/composer/installed.json" "$APP/core/src" \\
        "$APP/core/custom" "$APP/assets/plugins" "$APP/assets/snippets" "$APP/assets/modules" \\
        -type f \\( -name '*.php' -o -name installed.json \\) -newer /tmp/evo-code-stamp -print -quit)
    [ -n "$changed" ] || return 0
    log "code changed ($changed), restarting the workers"
    curl -fsS -X POST http://localhost:2019/frankenphp/workers/restart \\
        && mv /tmp/evo-code-next /tmp/evo-code-stamp
}
`;

const bootScript = (server: Server) => `#!/bin/sh
# Installs Evolution CMS on an empty core volume, applies a changed EVO_VERSION,
# rebuilds a lost core volume, then starts the scheduler and the web server.
# EVO_WEB_INSTALLER=on leaves the first install to the browser, behind EVO_INSTALL_KEY.
set -eu

APP=${webRoot}
# On the custom volume, so it outlives the core volume.
STATE=$APP/core/custom/.easypanel
SOURCE=/tmp/evo-source
export COMPOSER_HOME=/tmp/composer

log() { echo "[evo-boot] $*"; }
as_web() { su www-data -s /bin/sh -c "$1"; }

# Stay up without a web server: the console keeps working and restarts do not bury
# the log. No web server may start here: this site has no installer rule yet.
trap 'log "boot failed, see above; fix the cause and deploy again"; sleep infinity' EXIT

# The updater skips a directory it cannot write without saying so, and Docker
# creates mount points as root: a site left like this updates only partly.
own_files() {
    find "$APP" ! -user www-data -exec chown -h www-data:www-data {} +
}

lay_release() {
    log "downloading $EVO_REPOSITORY $1"
    rm -rf "$SOURCE"
    mkdir -p "$SOURCE"
    curl -fsSL --retry 5 "https://codeload.github.com/$EVO_REPOSITORY/tar.gz/$1" \\
        | tar -xz --strip-components=1 -C "$SOURCE"
    cp -a "$SOURCE/." "$APP/"
    rm -rf "$SOURCE"
    if [ ! -f "$APP/.htaccess" ] && [ -f "$APP/ht.access" ]; then
        cp "$APP/ht.access" "$APP/.htaccess"
    fi
    own_files
    # 3.6 and later keep core/vendor out of the repository.
    if [ ! -f "$APP/core/vendor/autoload.php" ]; then
        as_web "cd '$APP/core' && composer install --no-dev --no-interaction --no-progress --prefer-dist"
    fi
}

# A 3.5.9 installer that loses the server asks again and spins on closed stdin.
wait_for_database() {
    [ "$DB_TYPE" = sqlite ] && return 0
    attempts=0
    until php -r 'new PDO(getenv("DB_TYPE") . ":host=" . getenv("DB_HOST"), getenv("DB_USERNAME"), getenv("DB_PASSWORD"));' > /dev/null 2>&1; do
        attempts=$((attempts + 1))
        if [ "$attempts" -ge 90 ]; then
            log "the database did not answer in 180 seconds"
            exit 1
        fi
        sleep 2
    done
}

# A deployed site has no one at a console, so nothing here may depend on one: /install/ is
# refused by the web server before PHP unless the flag is on and the key is set. The lock of
# the installer goes to whoever comes first, which is why it cannot be the protection.
guard_installer() {
    open=
    if [ "\${EVO_WEB_INSTALLER:-off}" = on ]; then
        if [ -n "\${EVO_INSTALL_KEY:-}" ]; then
            open=1
        else
            log "EVO_INSTALL_KEY is empty, so /install/ stays closed"
        fi
    fi
    if [ -n "$open" ]; then
        EVO_INSTALL_HASH=$(php -r 'echo password_hash(getenv("EVO_INSTALL_KEY"), PASSWORD_BCRYPT);')
        export EVO_INSTALL_HASH
        printf 'install:%s\\n' "$EVO_INSTALL_HASH" > /tmp/evo-installer.htpasswd
        cat > "${server.ruleFile}" <<'RULE'
${server.openRule}
RULE
    else
        cat > "${server.ruleFile}" <<'RULE'
${server.closedRule}
RULE
    fi
}

remember_site() {
    mkdir -p "$STATE"
    cp "$APP/core/config/database/connections/default.php" "$STATE/default.php"
    printf '%s\\n' "$EVO_VERSION" > "$STATE/version"
    own_files
}

# What the site runs now: a manager or console update may have moved it past EVO_VERSION.
running_ref() {
    php -r '$v = include $argv[1]; echo $v["ref"] ?? $v["version"];' "$APP/core/factory/version.php"
}

install_site() {
    log "installing $EVO_VERSION on $DB_TYPE"
    lay_release "$EVO_VERSION"
    wait_for_database
    if [ "$DB_TYPE" = sqlite ]; then
        connection="--database=${sqliteDatabase}"
    else
        connection='--databaseServer="$DB_HOST" --database="$DB_DATABASE" --databaseUser="$DB_USERNAME" --databasePassword="$DB_PASSWORD"'
    fi
    as_web "cd '$APP/install' && php cli-install.php --typeInstall=1 --databaseType=\\"\\$DB_TYPE\\" $connection \\
        --tablePrefix=\\"\\$DB_PREFIX\\" --cmsAdmin=\\"\\$EVO_ADMIN\\" --cmsAdminEmail=\\"\\$EVO_ADMIN_EMAIL\\" \\
        --cmsPassword=\\"\\$EVO_ADMIN_PASSWORD\\" --language=\\"\\$EVO_LANGUAGE\\" --removeInstall=y --skipComposer=y < /dev/null"
    remember_site
}

# The core volume is gone but the site is not: the database and every other volume
# are intact, so this is an update of an empty tree, custom packages included.
rebuild_core() {
    ref=$(cat "$STATE/running")
    log "the core volume is empty, rebuilding it from $ref"
    lay_release "$ref"
    cp "$STATE/default.php" "$APP/core/config/database/connections/default.php"
    own_files
    wait_for_database
    consent=
    case "$EVO_UPDATE_OPTIONS" in
        *--update-custom-packages*) consent=--updateCustomPackages=y ;;
    esac
    as_web "cd '$APP/install' && php cli-install.php --typeInstall=2 --removeInstall=y $consent < /dev/null"
    # Only a new install writes this marker, and the CMS will not boot without it.
    date +%s > "$APP/core/.install"
    # cli-install drops the ref note of version.php, and without it the next rebuild would lay the older release.
    [ "$ref" = "$(running_ref)" ] || as_web "cd '$APP/core' && php artisan make:site update '$ref' $EVO_UPDATE_OPTIONS < /dev/null"
}

# The installer of a browser takes host names and database names the panel cannot give it:
# no underscore in a host, no slash in a name. DB_* still wins at run time, so both must
# lead to the same place.
prepare_web_install() {
    [ -f "$APP/index.php" ] || lay_release "$EVO_VERSION"
    rm -f "$APP/install.session.php"
    if [ "$DB_TYPE" = sqlite ]; then
        ln -sfn sqlite/evolution.sqlite "$APP/core/database/evolution.sqlite"
    else
        wait_for_database
        echo "$(getent hosts "$DB_HOST" | cut -d' ' -f1) database" >> /etc/hosts
    fi
    own_files
    log "waiting for the install at /install/: user install, password EVO_INSTALL_KEY"
}

# An update is under way, in any of the ways that lay a tree over the site.
busy() {
    [ -n "$(find "$APP/update.php" -mmin -10 2>/dev/null)" ] || ps -eo args | grep -Eq '[a]rtisan make:site|[c]li-install|[c]omposer'
}

# The classic updater of the manager lays install/ over the site and leaves the rest to the
# browser. With the installer closed the console finishes the update and removes the folder.
finish_update() {
    [ -d "$APP/install" ] && ! busy || return 0
    log "finishing the update left in install/ without the browser"
    consent=
    case "$EVO_UPDATE_OPTIONS" in
        *--update-custom-packages*) consent=--updateCustomPackages=y ;;
    esac
    as_web "cd '$APP/install' && php cli-install.php --typeInstall=2 --removeInstall=y $consent < /dev/null"
}

apply_version() {
    [ "$EVO_VERSION" = "$(cat "$STATE/version")" ] && return 0
    log "updating to $EVO_VERSION"
    wait_for_database
    if as_web "cd '$APP/core' && php artisan make:site update \\"\\$EVO_VERSION\\" $EVO_UPDATE_OPTIONS < /dev/null"; then
        remember_site
    else
        log "the update to $EVO_VERSION failed, see above; serving the site as it is"
    fi
}

web_installer() {
    [ "\${EVO_WEB_INSTALLER:-off}" = on ] && [ -n "\${EVO_INSTALL_KEY:-}" ]
}

log "${
  server.version.includes("frankenphp") ? "FrankenPHP" : "web server"
}: $(${server.version}); $(php -r 'echo "PHP ", PHP_VERSION;')"
own_files
guard_installer
awaiting_browser=
if [ -f "$APP/core/.install" ]; then
    [ -f "$STATE/version" ] || remember_site
    web_installer || finish_update || log "the update left in install/ failed, see above; serving the site as it is"
    apply_version
elif [ -f "$STATE/running" ]; then
    rebuild_core
    apply_version
elif web_installer; then
    prepare_web_install
    awaiting_browser=1
else
    install_site
fi
[ ! -f "$APP/core/.install" ] || running_ref > "$STATE/running"
own_files
${workerSetup(server)}
# Whatever finishes after the boot: the install of a browser, the update of the manager.
(
    while true; do
        sleep 15
        [ -f "$APP/core/.install" ] || continue
        [ -f "$STATE/version" ] || remember_site || true
        # The page of the installer offers this, but on a new site the removal answers 404.
        # A minute later, not at once: the marker is written before that page is rendered.
        if [ -n "$awaiting_browser" ] && [ -n "$(find "$APP/core/.install" -mmin +1)" ]; then
            log "the browser install is done, removing install/"
            rm -rf "$APP/install" "$APP/install.session.php"
            awaiting_browser=
        fi
        if ! web_installer; then
            finish_update || { log "the update left in install/ failed, see above"; sleep 300; }
        fi
        if [ "$APP/core/factory/version.php" -nt "$STATE/running" ] && ! busy; then
            running_ref > "$STATE/running" || true
            chown www-data:www-data "$STATE/running" || true
        fi
        ${server === servers.frankenphp ? "restart_workers || true" : ":"}
    done
) &

# A container has no cron, and the manager queues its tasks for this scheduler.
(
    until [ -f "$APP/core/.install" ]; do
        sleep 5
    done
    while true; do
        as_web "cd '$APP/core' && exec php artisan schedule:work" || true
        log "schedule:work exited, restarting in 5 seconds"
        sleep 5
    done
) &

${server.start}
`;

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const databaseServiceName = `${input.appServiceName}-db`;
  const sqlite = input.databaseType === "sqlite";
  const server = servers[input.webServer];
  const worker =
    input.webServer === "frankenphp"
      ? [
          `EVO_WORKER_MODE=${input.workerMode === "off" ? 0 : 1}`,
          `EVO_WORKER_KEEP_APP=${input.workerMode === "keep" ? 1 : 0}`,
          "EVO_WORKER_ORIGIN=https://$(PRIMARY_DOMAIN)",
        ]
      : [];

  const database = sqlite
    ? [
        "DB_TYPE=sqlite",
        `DB_DATABASE=${webRoot}/core/database/${sqliteDatabase}.sqlite`,
      ]
    : [
        `DB_TYPE=${input.databaseType === "postgres" ? "pgsql" : "mysql"}`,
        `DB_HOST=$(PROJECT_NAME)_${databaseServiceName}`,
        "DB_DATABASE=evolution",
        "DB_USERNAME=evolution",
        `DB_PASSWORD=${databasePassword}`,
      ];

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [
        `EVO_VERSION=${input.evolutionVersion}`,
        "EVO_REPOSITORY=evolution-cms/evolution",
        "EVO_UPDATE_OPTIONS=",
        `EVO_ADMIN=${input.adminUsername}`,
        `EVO_ADMIN_EMAIL=${input.adminEmail}`,
        `EVO_ADMIN_PASSWORD=${randomPassword()}`,
        `EVO_LANGUAGE=${input.language}`,
        `EVO_WEB_INSTALLER=${input.installer === "web" ? "on" : "off"}`,
        `EVO_INSTALL_KEY=${randomPassword()}`,
        ...worker,
        ...database,
        "DB_PREFIX=evo_",
      ].join("\n"),
      source: {
        type: "dockerfile",
        dockerfile: server.dockerfile(input.phpVersion),
      },
      // Stop first: an update must not run next to the old container on the same volumes.
      deploy: {
        replicas: 1,
        // exec: the panel runs this through /bin/sh -c, and as PID 1 that shell drops the stop signal.
        command: "exec sh /opt/evolution/boot.sh",
        zeroDowntime: false,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          port: 80,
        },
      ],
      mounts: [
        ...drives.map(([name, path]) => ({
          type: "volume" as const,
          name,
          mountPath: path === "" ? webRoot : `${webRoot}/${path}`,
        })),
        // Not core/database itself: the migrations of the core live there.
        ...(sqlite
          ? [
              {
                type: "volume" as const,
                name: "database",
                mountPath: `${webRoot}/core/database/sqlite`,
              },
            ]
          : []),
        {
          type: "file",
          content: bootScript(server),
          mountPath: "/opt/evolution/boot.sh",
        },
        {
          type: "file",
          content: phpIni,
          mountPath: "/usr/local/etc/php/conf.d/zz-evolution.ini",
        },
        ...server.mounts.map((mount) => ({ type: "file" as const, ...mount })),
      ],
    },
  });

  if (!sqlite) {
    services.push({
      type: input.databaseType as "mysql" | "postgres",
      data: {
        serviceName: databaseServiceName,
        image: input.databaseType === "mysql" ? "mysql:9.7" : "postgres:17.6",
        databaseName: "evolution",
        user: "evolution",
        password: databasePassword,
      },
    });
  }

  return { services };
}
