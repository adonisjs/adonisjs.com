---
summary: In this post, we will upgrade the tooling config of an AdonisJS application to use the latest version of ESLint, move to the maintained fork of TSNode, and update the prettier config to format Edge templates.
---

JavaScript ecosystem moves faster than the light of speed. Therefore, every once in a while, we find ourselves making changes to our apps that do not correlate to the app's main features.

For better or worse, staying up to date is always sane. Yes, sometimes, keeping up with changes can be taxing. Therefore, let me make that part easier for you.

In this post, we will upgrade the tooling config of an AdonisJS application to use the latest version of ESLint, move to the maintained fork of `ts-node`, and update the prettier config to format Edge templates.

But one thing at a time.

## Upgrading to ESLint 9.0

Let's start by upgrading the ESLint setup to use the latest version of ESLint, ie `9.x.x`. This major release of ESLint resulted in a massive breaking change in almost every corner of the ecosystem. It includes:

- Using a JavaScript or a TypeScript-based config file. The ESLint rules from the `package.json` file are no longer respected.
- Plugins must be imported and registered explicitly. String-based plugin identifiers no longer work.
- You cannot extend configs using the `extend` property.
- Many of the stylistic rules have been removed. Fortunately, we can get them back using the [ESLint Stylistic](https://eslint.style/) project.
- The resolution logic of rules, files, and plugins inside the config has been revamped under the project name Flat config.
- Usage of the `eslintignore` file is discouraged. It is recommended to ignore files via the config blocks.

If you use our preset for the ESLint config (i.e., `@adonisjs/eslint-config` package), then upgrading to ESLint 9.0 will be smooth. 

Start by upgrading the `eslint` package and then the `@adonisjs/eslint-config` package. **Make sure to do it in two steps. Otherwise, you might encounter some peer dependency errors**.


:::note

The `@adonisjs/eslint-config` package is published under the `@beta` tag because we want to test our config preset against the latest version of ESLint first. We will publish a stable release once all the edge cases have been ironed out.

:::

```sh
# First upgrade eslint
npm i -D eslint@9

# Then upgrade the config preset
npm i -D @adonisjs/eslint-config@beta
```

Once you have upgraded the dependencies, you must create the `eslint.config.js` in the root of your application and copy/paste the following contents inside it.

```ts
// title: eslint.config.js
import { configApp } from '@adonisjs/eslint-config'
export default configApp()
```

Finally, you must remove the old config from the `package.json` file.

```json
// title:package.json
// delete-start
{
 "eslintConfig": {
    "extends": "@adonisjs/eslint-config/app"
  }
}
// delete-end
```

Run the `npm run lint` command to test the new setup. Feel free to join the [Discord server](https://discord.gg/vDcEjq6) and ask for help, or [create a new discussion thread on Github](https://github.com/orgs/adonisjs/discussions/new?category=help)

## Upgrading to the latest preset of Prettier

This one is simple. We have updated our Prettier preset to include the [prettier-plugin-edgejs](https://github.com/sajansharmanz/prettier-plugin-edgejs) by default. Therefore, upgrading it to the latest version will auto-format the Edge templates using Prettier. 

```sh
npm i -D @adonisjs/prettier-config@latest
```

Feel free to report any rough edges with the Edge plugin for prettier on the [Github repo](https://github.com/sajansharmanz/prettier-plugin-edgejs).

## Upgrading to the maintained fork of ts-node

[TSNode](https://typestrong.org/ts-node/) is a fantastic project. It is the only TypeScript JIT compiler that is 100% compatible with the Node.js ESM implementation. Therefore, we have been using it despite the other popular alternatives like [TSX](https://tsx.is/).

However, the activity level on TSNode has dropped, and many [critical PRs](https://github.com/TypeStrong/ts-node/pull/2073) remain unattended.  

Therefore, we have decided to fork `ts-node` under a new name called [`ts-node-maintained`](https://github.com/thetutlage/ts-node-maintained). We aim to apply critical bug fixes without changing the architecture or direction of the project. Once the authors of TSNode decide to become active, we will be happy to merge our changes back to the source.

Start by uninstalling `ts-node` and installing `ts-node-maintained` instead. Also, upgrade the `@adonisjs/assembler` package to its latest version.

```sh
npm uninstall ts-node

npm i -D ts-node-maintained @adonisjs/assembler@latest
```

Update the `ace.js` file with the following changes.

```ts
// delete-start
import { register } from 'node:module'
register('ts-node/esm', import.meta.url)
// delete-end
// insert-start
import 'ts-node-maintained/register/esm'
// end
```

That’s all! Now, you can be in Zen mode as you are using the latest version of ESLint, and you do not have to see deprecation warnings coming from TSNode.
