import * as templates from "../templates/_list";

async function run() {
  const result = Object.entries(templates).map((entry) => {
    const [name, value] = entry;
    return { name, label: value.name };
  });

  console.log(result);
}

run().catch(console.error);
