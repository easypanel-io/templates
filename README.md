# Easypanel Templates

In this repository, you will find the templates available in Easypanel.

[Playground URL](https://easypanel-templates.netlify.app/)

## Defining Templates

1. Duplicate any template from the `/templates` directory
2. Run `yarn build-templates`
3. Run `yarn dev` to open the testing playground
4. Customize your template.
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
