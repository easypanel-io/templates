import { existsSync } from "fs";
import { copyFile, mkdir, rm, writeFile } from "fs/promises";
import * as path from "path";
import templates from "../templates";

const docsPath = path.resolve(__dirname, "../docs");
const templatesPath = path.resolve(__dirname, "../templates");

async function run() {
  try {
    await rm(docsPath, { recursive: true, force: true });
  } catch {}
  await mkdir(docsPath);

  const list = [];

  // create a folder for each template
  for (let { slug, meta } of templates) {
    await mkdir(path.resolve(docsPath, slug), { recursive: true });

    const logo = getTemplateLogo(path.resolve(templatesPath, slug));
    const screenshot = getTemplateScreenshot(path.resolve(templatesPath, slug));

    const lines: string[] = [
      "---",
      `sidebar_label: ${meta.name}`,
      `title: ${meta.name}`,
      `description: How to install ${meta.name} on Easypanel? 1-Click installation template for ${meta.name} on Easypanel`,
      "---",
      "",
      "<!-- generated -->",
      "",
    ];

    lines.push(
      `1-Click installation template for ${meta.name} on Easypanel`,
      ""
    );

    if (meta?.description) {
      lines.push("## Description", "", meta.description, "");
    }

    if (meta?.instructions) {
      lines.push("## Instructions", "", meta.instructions, "");
    }

    if (meta?.links?.length) {
      lines.push("## Links", "");
      meta.links.forEach((entry) => {
        lines.push(`- [${entry.label}](${entry.url})`);
      });
      lines.push("");
    }

    {
      lines.push(
        "## Options",
        "",
        "Name | Description | Required | Default Value",
        "-|-|-|-"
      );
      Object.entries(meta.schema.properties).forEach((entry: any) => {
        const [key, value] = entry;
        if (key === "projectName") return;
        lines.push(
          `${value.title ?? key} | ${value.description ?? "-"} | ${
            meta.schema.required.includes(key as any) ? "yes" : "no"
          } | ${value.default ?? ""}`
        );
      });
      lines.push("");
    }

    if (screenshot) {
      lines.push(
        "## Screenshot",
        "",
        `![${meta.name} Screenshot](./${screenshot})`,
        ""
      );
    }

    if (meta?.changeLog?.length) {
      lines.push("## Change Log", "");
      meta.changeLog.forEach((entry) => {
        lines.push(`- ${entry.date} – ${entry.description}`);
      });
      lines.push("");
    }

    if (meta?.contributors?.length) {
      lines.push("## Contributors", "");
      meta.contributors.forEach((entry) => {
        lines.push(`- [${entry.name}](${entry.url})`);
      });
      lines.push("");
    }

    const filePath = path.resolve(docsPath, slug, "index.md");
    const content = lines.join("\n");

    await writeFile(filePath, content);

    if (logo) {
      await copyFile(
        path.resolve(templatesPath, slug, logo),
        path.resolve(docsPath, slug, logo)
      );
    }

    if (screenshot) {
      await copyFile(
        path.resolve(templatesPath, slug, screenshot),
        path.resolve(docsPath, slug, screenshot)
      );
    }

    list.push({ slug, logo, name: meta.name });
  }

  await writeFile(
    path.resolve(docsPath, "templates.json"),
    JSON.stringify(list, null, 2)
  );

  await writeFile(
    path.resolve(docsPath, "_category_.json"),
    JSON.stringify({ label: "Templates" }, null, 2)
  );
}

function fileExists(path: string) {
  try {
    return existsSync(path);
  } catch {
    return false;
  }
}

function getTemplateLogo(dir: string) {
  if (fileExists(path.resolve(dir, "logo.svg"))) {
    return "logo.svg";
  }
  if (fileExists(path.resolve(dir, "logo.png"))) {
    return "logo.png";
  }
  return null;
}

function getTemplateScreenshot(dir: string) {
  if (fileExists(path.resolve(dir, "screenshot.jpg"))) {
    return "screenshot.jpg";
  }
  if (fileExists(path.resolve(dir, "screenshot.png"))) {
    return "screenshot.png";
  }
  return null;
}

run().catch(console.error);
