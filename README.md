# Easypanel Templates

In this repository, you will find the templates available in Easypanel.

[Playground URL](https://easypanel-templates.netlify.app/)

## Defining Templates

1. Duplicate any template from the `/templates` directory
2. Run `npm run dev` to open the testing playground
3. Customize your template.
   - edit `meta.yaml` and `index.ts`, but not `meta.ts` (that file is generated)
   - use `logo.png` or `logo.svg` for the logo
   - use `screenshot.png` or `screenshot.jpg` for the screenshot
   - if you have multiple screenshots use `screenshot1.png`, `screenshot2.png`,
     etc
4. Test your template. Inside an Easypanel instance, you can create a template
   from JSON. Use that feature to test the output of your template.
5. Send a PR.

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

## PR Checklist

- [ ]  Logo
    - [ ]  high quality
    - [ ]  just the logo mark (icon)
    - [ ]  square aspect ratio
- [ ]  Screenshot
    - [ ]  high quality
    - [ ]  it’s not a banner
    - [ ]  doesn’t include the whole desktop
    - [ ]  shows actual content, not an empty state
- [ ]  meta.yaml
    - [ ]  use static versions
    - [ ]  use specific versions (2.1.7, instead of 2.1, or 2)
    - [ ]  add all links (website, docs, Github)
    - [ ]  don’t forget instructions
    - [ ]  use official images (if not possible, explain)
- [ ]  index.ts
    - [ ]  no unused variables
    - [ ]  no hardcoded secrets (generate random ones)
    - [ ]  extract env vars which are used multiple times
    - [ ]  don’t forget volumes
- [ ]  Testing
    - [ ]  test using the templates playground
