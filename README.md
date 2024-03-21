# Easypanel Templates

In this repository, you will find the templates available in Easypanel.

[Playground URL](https://easypanel-templates.netlify.app/)

## Defining Templates

1. Run `npm install` to install project dependencies
2. Run `npm run generate-template` to interactive create a new template.
3. Customize your template as you need.
   - edit `meta.yaml` and `index.ts`, but not `meta.ts` (that file is generated)
   - use `logo.png` or `logo.svg` for the logo
   - use `screenshot.png` or `screenshot.jpg` for the screenshot
   - if you have multiple screenshots use `screenshot1.png`, `screenshot2.png`, etc
4. Run `npm run dev` to test your template. Inside an Easypanel instance, you can create a template from JSON. Use that feature to test the output of your template.
5. Send your Pull Request.

## Best practices

- use `npm run build` to make sure the project is building succesfully
- use `npm run prettier` to format the files
- for stability, don't use `latest` for docker images
- for security, don't use unofficial docker images

## Form Fields

### Select

```yaml
selectField:
  type: string
  title: Select Field
  oneOf:
    - enum:
        - first
      title: First Option
    - enum:
        - second
      title: Second Option
    - enum:
        - third
      title: Third Option
```
