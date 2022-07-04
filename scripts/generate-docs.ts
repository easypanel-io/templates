import { mkdir, rmdir, writeFile } from "fs/promises";
import * as path from "path";
import * as templates from "../templates/_list";

const dirPath = path.resolve(__dirname, "../docs");

async function run() {
  try {
    await rmdir(dirPath);
    await mkdir(dirPath);
  } catch {}

  for (let [key, template] of Object.entries(templates)) {
    const lines: string[] = [
      "---",
      `sidebar_label: ${template.name}`,
      `title: ${template.name}`,
      `description: How to install ${template.name} on Easypanel? 1-Click installation template for ${template.name} on Easypanel`,
      "---",
      "<!-- generated -->",
    ];

    lines.push(
      `1-Click installation template for ${template.name} on Easypanel`,
      ""
    );

    if (template.meta?.description) {
      lines.push("## Description", "", template.meta.description, "");
    }

    if (template.meta?.instructions) {
      lines.push("## Instructions", "", template.meta.instructions, "");
    }

    if (template.meta?.links?.length) {
      lines.push("## Links", "");
      template.meta.links.forEach((entry) => {
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
      Object.entries(template.schema.properties).forEach((entry) => {
        const [key, value] = entry;
        if (key === "projectName") return;
        lines.push(
          `${value.title ?? key} | ${value.description ?? "-"} | ${
            template.schema.required.includes(key as any) ? "yes" : "no"
          } | ${value.default ?? ""}`
        );
      });
      lines.push("");
    }

    if (template.meta?.screenshots?.length) {
      lines.push("## Screenshots", "");
      template.meta.screenshots.forEach((entry) => {
        lines.push(`![${entry.alt}](${entry.url})`);
      });
      lines.push("");
    }

    if (template.meta?.changeLog?.length) {
      lines.push("## Change Log", "");
      template.meta.changeLog.forEach((entry) => {
        lines.push(`- ${entry.date} – ${entry.description}`);
      });
      lines.push("");
    }

    if (template.meta?.contributors?.length) {
      lines.push("## Contributors", "");
      template.meta.contributors.forEach((entry) => {
        lines.push(`- [${entry.name}](${entry.url})`);
      });
      lines.push("");
    }

    const filePath = path.resolve(dirPath, `${key}.md`);
    const content = lines.join("\n");
    console.log(filePath);

    await writeFile(filePath, content);
  }
}

run().catch(console.error);
