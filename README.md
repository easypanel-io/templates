# Easypanel Templates

In this repository, you will find the templates available in Easypanel.

[Playground URL](https://easypanel-templates.netlify.app/)

## Development Enviroment SETUP

1. Run `npm i` to install all dependencies.
2. Install yarn => [windows](https://github.com/yarnpkg/yarn/releases/download/v1.22.4/yarn-1.22.4.msi) [mac](https://tecadmin.net/install-yarn-macos) [linux](https://classic.yarnpkg.com/lang/en/docs/install/)
3. Run `yarn dev` in project directory to check if installed.
4. Go to `xxx.xxx.xxx.xxx:3000`

## Defining Templates

1. Duplicate any template from the `/templates` directory
2. Run `yarn build-templates`
3. Run `yarn dev` to open the testing playground
4. Customize your template. 
5. Make sure the icon is either a `.png, .jpg, or .jpeg`, and is `200x200` pixels in size.
6. Test your template. Inside an Easypanel instance, you can create a template from JSON. Use that feature to test the output of your template.
7. Send a PR.

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
