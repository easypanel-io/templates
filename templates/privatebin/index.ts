import {
  Output,
  Services,
  randomPassword,
  randomString,
} from "~templates-utils";
import { Input } from "./meta";

export function generate(input: Input): Output {
  const services: Services = [];
  const databasePassword = randomPassword();
  const randomKey = randomString();

  services.push({
    type: "app",
    data: {
      serviceName: input.appServiceName,
      env: [].join("\n"),
      source: {
        type: "image",
        image: input.appServiceImage,
      },
      domains: [
        {
          host: "$(EASYPANEL_DOMAIN)",
          path: "/",
          port: 80,
        },
      ],
      mounts: [
        {
          type: "volume",
          name: "data",
          mountPath: "/srv/data",
        },
        {
          type: "file",
          content:
            ';<?php http_response_code(403); /*\r\n; config file for PrivateBin\r\n;\r\n; An explanation of each setting can be find online at https://github.com/PrivateBin/PrivateBin/wiki/Configuration.\r\n\r\n[main]\r\n; (optional) set a project name to be displayed on the website\r\n; name = "PrivateBin"\r\n\r\n; enable or disable the discussion feature, defaults to true\r\ndiscussion = true\r\n\r\n; preselect the discussion feature, defaults to false\r\nopendiscussion = false\r\n\r\n; enable or disable the password feature, defaults to true\r\npassword = true\r\n\r\n; enable or disable the file upload feature, defaults to false\r\nfileupload = true\r\n\r\n; preselect the burn-after-reading feature, defaults to false\r\nburnafterreadingselected = true\r\n\r\n; which display mode to preselect by default, defaults to "plaintext"\r\n; make sure the value exists in [formatter_options]\r\ndefaultformatter = "plaintext"\r\n\r\n; (optional) set a syntax highlighting theme, as found in css/prettify/\r\n; syntaxhighlightingtheme = "sons-of-obsidian"\r\n\r\n; size limit per paste or comment in bytes, defaults to 2 Mebibytes\r\nsizelimit = 4194304\r\n\r\n; template to include, default is "bootstrap" (tpl/bootstrap.php)\r\ntemplate = "bootstrap"\r\n\r\n; (optional) notice to display\r\n; notice = "Note: This is a test service: Data may be deleted anytime. Kittens will die if you abuse this service."\r\n\r\n; by default PrivateBin will guess the visitors language based on the browsers\r\n; settings. Optionally you can enable the language selection menu, which uses\r\n; a session cookie to store the choice until the browser is closed.\r\nlanguageselection = false\r\n\r\n; set the language your installs defaults to, defaults to English\r\n; if this is set and language selection is disabled, this will be the only language\r\n; languagedefault = "en"\r\n\r\n; (optional) URL shortener address to offer after a new paste is created\r\n; it is suggested to only use this with self-hosted shorteners as this will leak\r\n; the pastes encryption key\r\n; urlshortener = "https://shortener.example.com/api?link="\r\n\r\n; (optional) Let users create a QR code for sharing the paste URL with one click.\r\n; It works both when a new paste is created and when you view a paste.\r\n; qrcode = true\r\n\r\n; (optional) IP based icons are a weak mechanism to detect if a comment was from\r\n; a different user when the same username was used in a comment. It might be\r\n; used to get the IP of a non anonymous comment poster if the server salt is\r\n; leaked and a SHA256 HMAC rainbow table is generated for all (relevant) IPs.\r\n; Can be set to one these values: none / vizhash / identicon (default).\r\n; icon = none\r\n\r\n; Content Security Policy headers allow a website to restrict what sources are\r\n; allowed to be accessed in its context. You need to change this if you added\r\n; custom scripts from third-party domains to your templates, e.g. tracking\r\n; scripts or run your site behind certain DDoS-protection services.\r\n; Check the documentation at https://content-security-policy.com/\r\n; Note: If you use a bootstrap theme, you can remove the allow-popups from the sandbox restrictions.\r\n; By default this disallows to load images from third-party servers, e.g. when they are embedded in pastes. If you wish to allow that, you can adjust the policy here. See https://github.com/PrivateBin/PrivateBin/wiki/FAQ#why-does-not-it-load-embedded-images for details.\r\n; cspheader = "default-src \'none\'; manifest-src \'self\'; connect-src *; script-src \'self\' \'unsafe-eval\'; style-src \'self\'; font-src \'self\'; img-src \'self\' data: blob:; media-src blob:; object-src blob:; Referrer-Policy: \'no-referrer\'; sandbox allow-same-origin allow-scripts allow-forms allow-popups allow-modals"\r\n\r\n; stay compatible with PrivateBin Alpha 0.19, less secure\r\n; if enabled will use base64.js version 1.7 instead of 2.1.9 and sha1 instead of\r\n; sha256 in HMAC for the deletion token\r\nzerobincompatibility = false\r\n\r\n[expire]\r\n; expire value that is selected per default\r\n; make sure the value exists in [expire_options]\r\ndefault = "1day"\r\n\r\n[expire_options]\r\n; Set each one of these to the number of seconds in the expiration period,\r\n; or 0 if it should never expire\r\n5min = 300\r\n10min = 600\r\n1hour = 3600\r\n1day = 86400\r\n1week = 604800\r\n; Well this is not *exactly* one month, it\'s 30 days:\r\n1month = 2592000\r\n1year = 31536000\r\nnever = 0\r\n\r\n[formatter_options]\r\n; Set available formatters, their order and their labels\r\nplaintext = "Plain Text"\r\nsyntaxhighlighting = "Source Code"\r\nmarkdown = "Markdown"\r\n\r\n[traffic]\r\n; time limit between calls from the same IP address in seconds\r\n; Set this to 0 to disable rate limiting.\r\nlimit = 10\r\n\r\n; (optional) if your website runs behind a reverse proxy or load balancer,\r\n; set the HTTP header containing the visitors IP address, i.e. X_FORWARDED_FOR\r\nheader = "X_FORWARDED_FOR"\r\n\r\n; directory to store the traffic limits in\r\ndir = PATH "data"\r\n\r\n[purge]\r\n; minimum time limit between two purgings of expired pastes, it is only\r\n; triggered when pastes are created\r\n; Set this to 0 to run a purge every time a paste is created.\r\nlimit = 300\r\n\r\n; maximum amount of expired pastes to delete in one purge\r\n; Set this to 0 to disable purging. Set it higher, if you are running a large\r\n; site\r\nbatchsize = 30\r\n\r\n; directory to store the purge limit in\r\ndir = PATH "data"\r\n\r\n[model]\r\n; name of data model class to load and directory for storage\r\n; the default model "Filesystem" stores everything in the filesystem\r\nclass = Filesystem\r\n[model_options]\r\ndir = PATH "data"\r\n\r\n;[model]\r\n; example of DB configuration for MySQL\r\n;class = Database\r\n;[model_options]\r\n;dsn = "mysql:host=localhost;dbname=privatebin;charset=UTF8"\r\n;tbl = "privatebin_"\t; table prefix\r\n;usr = "privatebin"\r\n;pwd = "Z3r0P4ss"\r\n;opt[12] = true\t  ; PDO::ATTR_PERSISTENT\r\n\r\n;[model]\r\n; example of DB configuration for SQLite\r\n;class = Database\r\n;[model_options]\r\n;dsn = "sqlite:" PATH "data/db.sq3"\r\n;usr = null\r\n;pwd = null\r\n;opt[12] = true\t; PDO::ATTR_PERSISTENT',
          mountPath: "/srv/cfg/conf.php",
        },
      ],
    },
  });

  return { services };
}
