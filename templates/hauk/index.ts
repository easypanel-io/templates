import { bcryptHash, Output, Services } from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const passwordHash = bcryptHash(input.serverPassword);

  const configPhp = `<?php const CONFIG = array(
"storage_backend"       => MEMCACHED,
"memcached_host"        => 'localhost',
"memcached_port"        => 11211,
"memcached_binary"      => false,
"memcached_use_sasl"    => false,
"memcached_sasl_user"   => "",
"memcached_sasl_pass"   => "",
"memcached_prefix"      => 'hauk',
"redis_host"            => 'localhost',
"redis_port"            => 6379,
"redis_use_auth"        => false,
"redis_auth"            => '',
"redis_prefix"          => 'hauk',
"auth_method"           => PASSWORD,
"password_hash"         => '${passwordHash}',
"htpasswd_path"         => '/etc/hauk/users.htpasswd',
"ldap_uri"              => 'ldaps://ldap.example.com:636',
"ldap_start_tls"        => false,
"ldap_base_dn"          => 'ou=People,dc=example,dc=com',
"ldap_bind_dn"          => 'cn=admin,dc=example,dc=com',
"ldap_bind_pass"        => '',
"ldap_user_filter"      => '(uid=%s)',
"allow_link_req"        => true,
"reserved_links"        => [],
"reserve_whitelist"     => false,
"link_style"            => LINK_4_PLUS_4_UPPER_CASE,
"map_tile_uri"          => 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
"map_attribution"       => 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
"default_zoom"          => 14,
"max_zoom"              => 19,
"max_duration"          => 86400,
"min_interval"          => 1,
"offline_timeout"       => 30,
"request_timeout"       => 10,
"max_cached_pts"        => 3,
"max_shown_pts"         => 100,
"v_data_points"         => 2,
"trail_color"           => '#d80037',
"velocity_unit"         => KILOMETERS_PER_HOUR,
"public_url"            => 'https://$(PRIMARY_DOMAIN)/'
);
`;

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
          port: 80,
        },
      ],
      mounts: [
        {
          type: "file",
          content: configPhp,
          mountPath: "/etc/hauk/config.php",
        },
        {
          type: "volume",
          name: "config",
          mountPath: "/etc/hauk",
        },
      ],
    },
  });

  return { services };
}
