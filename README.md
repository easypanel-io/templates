# Easypanel Templates

In this repository, you will find the templates available in Easypanel.

Here is how you define a template.

```ts
import type { AppService } from "~templates-utils";
import { createTemplate } from "~templates-utils";

export default createTemplate({
  name: "Adminer",
  schema: {
    type: "object",
    required: ["projectName", "serviceName", "domain"],
    properties: {
      projectName: {
        type: "string",
        title: "Project Name",
      },
      serviceName: {
        type: "string",
        title: "Service Name",
        default: "adminer",
      },
      domain: {
        type: "string",
        title: "Domain",
      },
    },
  } as const,
  generate({ projectName, serviceName, domain }) {
    const appService: AppService = {
      projectName,
      serviceName,
      source: {
        type: "image",
        image: "adminer",
      },
      proxy: {
        port: 8080,
        secure: true,
      },
      domains: [{ name: domain }],
    };

    return {
      services: [{ type: "app", data: appService }],
    };
  },
});
```

## Template Properties

- `name`
- `schema` is a JSON Schema. This is used to generate the form and validate the input. Important: do not remove the `as const` at the end of your schema in order to keep the type inference working.
- `generate` is the core of the template. It receives the form data and returns the template schema.
- `validate` (optional) is used for custom validation rules
- `transformErrors` (optional) is used for custom error messages

## Defining Templates

1. Duplicate any template from the `/templates` directory
2. Re-export the newly created template from `/templates/_list.ts`
3. Run `yarn dev` to open the testing playground
4. Customize your template.
5. Test your template. Inside an Easypanel instance, you can create a template from JSON. Use that feature to test the output of your template.
6. Send a PR.

## Type Safety

Templates are written in Typescript. We try to infer as much as possible from the `schema`. The `createTemplate` function doesn't do anything at the runtime. It is only used to give you better type inference.

## Custom Validation Rules

```ts
{
  // ...
  validate(formData, errors) {
    if (formData.pass1 !== formData.pass2) {
      errors.pass2.addError("Passwords don't match");
    }
    return errors;
  }
}
```

## Custom Error Messages

```ts
{
  // ...
  transformErrors(errors) {
    return errors.map((error) => {
      if (error.name === "pattern") {
        error.message = "Only digits are allowed";
      }
      return error;
    });
  }
}
```

## Form Fields

### Select

```ts
{
  // ...
  selectField: {
    type: "string",
    title: "Select Field",
    oneOf: [
      { enum: ["first"], title: "First Option" },
      { enum: ["second"], title: "Second Option" },
      { enum: ["third"], title: "Third Option" },
    ],
  },
}
```
