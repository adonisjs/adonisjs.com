---
summary: Hot Module Replacement (HMR) is now available in AdonisJS.
---

We're thrilled to announce that HMR is now available in AdonisJS!

In short: HMR now allows us to modify the code of our controllers and their dependencies without having to restart the entire dev server each time. This results in a much faster feedback loop and a significantly improved development experience.

## Hot Hook

We've developed [Hot-Hook](https://github.com/Julien-R44/hot-hook), a framework-agnostic library that enables HMR in Node.js using ESM. The library works with any framework. It's also important to note that Hot-hook **does not perform any static analysis, heavy code transformations, AST parsing, or bundling**.

The approach is very simple but works perfectly. 

:::note
Make sure to read the documentation of [Hot-Hook](https://github.com/Julien-R44/hot-hook) which contains a lot of information about how it works, configuration, and some key concepts of the library.
:::

### How does it work?

Since ESM uses `URL`, we can leverage the **cache busting** mechanism to ensure fresh modules are loaded. Here's a summary of how it works: 

- Hot Hook is a [hook](https://nodejs.org/api/module.html#customization-hooks) for Node.js. In short: a hook is a way to execute some code when you import a module in your own codebase.
- When you start your server with `node ace serve --hmr`, Hot Hook is loaded and will build a dependency graph of your application.
- When you modify a file, Hot Hook will detect the change and will increment a version number for the file.
- When the updated file is imported again, Hot Hook will append the version number to the `import` statement. That means we gonna `import('#controllers/users_controller.ts?version=2')`, and by doing this, we bypass the cache of the module and get the latest version of the file.

This is a quick summary of how Hot Hook works, there is a bit more to it, but this is the main idea.

Feel free to dive into the [Hot-Hook README](https://github.com/Julien-R44/hot-hook) for more information.

## Using HMR in AdonisJS

To use HMR in AdonisJS, you'll first need to install version `6.x.x` of `@adonisjs/core`.

Then, install `hot-hook`:

```bash
npm install -D hot-hook
```

Once done, you need to add the following configuration to your `package.json`

```jsonc
// title: package.json
{
  "name": "adonis-app",
  "type": "module",
  // ...
  "hotHook": {
    "boundaries": [
      "./app/controllers/**/*.ts",
      "./middlewares/*.ts",
    ]
  }
}
```

Then run `node ace serve --hmr` to start the dev server. If you modify a controller, you will see that the server does not restart, but the modifications will be taken into account: you'll always have the latest version of your code.

For more information on using it in AdonisJS, you can check out the [documentation page](https://docs.adonisjs.com/hot-module-reloading).

## Why HMR?

Here are a few reasons why we decided to add this feature.

### TSX as a template engine

There's increasing talk about [using TSX as a template engine](https://adonisjs.com/blog/use-tsx-for-your-template-engine) in AdonisJS, as an alternative to Edge.

With Edge, we don't need HMR, because Edge files are not JavaScript modules, they are not directly `import`ed and thus are not cached. Basically, to render an Edge view, we read the `.edge` file with `readFile` then compile it. Each time. So, we always have the latest version of the file when a view is rendered.

However, with TSX: we're working with JavaScript modules. And, when a JavaScript module is imported, it gets cached. No matter how many times you modify the file, the imported module will always remain the same until the process is restarted.

As a result, even a simple modification in our TSX view would cause a complete server restart, which can be long and tedious when developing your UI.

That's where HMR comes in: now, a modification of our TSX view just causes a page refresh, without server restart, and it's almost instantaneous. We now have an even better DX with TSX. **Really, it's a game changer.**

### Large applications

Server restarts can be slow for applications that use many packages. The more providers you add, the more code there is to import and initialize at application startup. And the boot time can quickly reach several seconds: this can be a bit frustrating development experience.

### ESM slower than CommonJS

To accentuate all the issues mentioned above, ESM loads significantly slower than CommonJS. Bun talks about this in this [blog post](https://bun.sh/blog/commonjs-is-not-going-away#the-case-for-commonjs):

![esm-vs-cjs](./cjs-vs-esm.png)

The benchmark has been done using Bun, but the numbers are similar when using Node.js. Note that the Node.js team is actively working on improving ESM performance.

As a side note, this is also why most Adonis.JS packages are bundled with `tsup`: fewer files to load and, therefore, a faster boot time. During the development of AdonisJS 6 last summer, we cut the application boot time in half just by bundling all of our packages.

### Vite Experimental

Finally, as we explained in [this article](https://adonisjs.com/blog/future-plans-for-adonisjs-6#current-implementation), our approach with Vite has changed: to have SSR support, we must launch Vite directly in the AdonisJS process rather than running it as a subprocess. 

A full server restart also restarts Vite, which can drastically impact the application boot time.

## Conclusion

These are the main reasons we added HMR to AdonisJS. We've tested this feature internally for several weeks and we are super happy with the outcomes.

We hardly ever need to reload the whole server now: only for things like adding a route or modifying a config file. But that's a minor part of the development process. Most of the time, it's all about HMR, and it really saves time and increases comfort.

In conclusion, HMR is a feature that will really improve the development experience on AdonisJS. We're excited to see what you think of it, and we hope you'll enjoy this feature as much as we do.

If you encounter any problems, don't hesitate to open an issue or come discuss it on our [Discord](https://discord.gg/vDcEjq6).
