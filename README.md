# Easypanel Templates

In this repository, you will find the templates available in Easypanel.

[Playground URL](https://easypanel-templates.netlify.app/)

## Defining Templates

1. Duplicate any template from the `/templates` directory
2. Run `yarn build-templates`
3. Run `yarn dev` to open the testing playground
4. Customize your template.
   - edit `meta.yaml` and `index.ts`, but not `meta.ts` (that file is generated)
   - use `logo.png` or `logo.svg` for the logo
   - use `screenshot.png` or `screenshot.jpg` for the screenshot
   - if you have multiple screenshots use `screenshot1.png`, `screenshot2.png`, etc
5. Test your template. Inside an Easypanel instance, you can create a template from JSON. Use that feature to test the output of your template.
6. Send a PR.

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
