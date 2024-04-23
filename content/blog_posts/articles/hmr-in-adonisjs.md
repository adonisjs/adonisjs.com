---
summary: Hot Module Replacement (HMR) is now available in AdonisJS.
---

We're thrilled to announce that **HMR is now available in AdonisJS**! Before anything, let me quickly explain what this enables. 

HMR allows us to modify the code of our controllers/middleware and their dependencies (services, repositories, models, etc.) without restarting the entire dev server each time. This results in a faster feedback loop, which in turn improves the developer experience.

I will first explain how to add HMR to your AdonisJS application, and then we'll go into more detail about why we felt the need to add HMR to AdonisJS and how it works under the hood. Grab a coffee - it's going to be a long read!

## Adding HMR to your AdonisJS Application

To use HMR in AdonisJS, you must first upgrade `@adonisjs/core` and `@adonisjs/assembler` to the latest version and install `hot-hook`.

```bash
npm i -D hot-hook @adonisjs/assembler@latest
npm i @adonisjs/core@latest
```

Next, update your `package.json` file with the following configuration:

```jsonc
// title: package.json
{
  "hotHook": {
    "boundaries": [
      "./app/controllers/**/*.ts",
      "./app/middleware/*.ts"
    ]
  }
}
```

Then run the following command to start your dev server:

```bash
node ace serve --hmr
```

Note that you no longer need the `--watch` flag. Only `--hmr` is enough. If you are using npm scripts, you can update your `dev` script with the following:

```jsonc
// title: package.json
{
  "scripts": {
    "dev": "node ace serve --hmr"
  }
}
```

Now, try modifying a controller. You will see that the server does not restart, but the modifications will be considered: you'll always have the latest version of your code.

For more information, please consult the [official documentation](https://docs.adonisjs.com/guides/hot-module-reloading).

## Backstory

Having HMR in a backend-first framework is rare. In fact, we didn't need it for all these years and followed the common wisdom of restarting the entire process after a file change.

However, restarting the entire process is slow. It takes a couple hundred milliseconds to restart the server (in a good-case scenario) and might take a second or longer (in worst-case scenarios).

On top of that, we recently made certain changes to the framework, which negatively impacted the server's boot time. These changes include:

- Using ES modules. ESM is inherently slower than CommonJS.

- Encouraging the use of TSX. TSX files are standard JavaScript modules, so we must restart the process whenever a TSX module changes.

- Embedding the Vite dev server in the same process as the AdonisJS HTTP server. This means that every time we restart the AdonisJS process, we also have to reboot the Vite dev server.

These three changes are part of why we felt the need for HMR. Let's discuss each point in more detail.

### ESM migration

Bun has [written an article recently](https://bun.sh/blog/commonjs-is-not-going-away), where they compare the performance of CommonJS and ES modules.

![ESM vs CommonJS](./cjs-vs-esm.png)

As you can see, ESM takes 2.5 times longer to load than CommonJS. This benchmark was done on Bun, but the numbers are similar to those on Node.js. ESM takes longer to load because its design is more complex. In the Node.js documentation, you can find the resolution algorithm for these two module systems.

- **ESM resolution algorithm** - https://nodejs.org/api/esm.html#resolution-algorithm
- **CommonJS resolution algorithm** - https://nodejs.org/api/modules.html#all-together

So, migrating to ESM significantly slowed down the boot time of an AdonisJS application. We faced this problem last summer when we noticed that boot time began to explode as we migrated the packages. 

This was particularly true on Windows, which has a very slow filesystem compared to Unix systems. On my Windows PC, I could reach up to 2/3 seconds of boot time, while the rest of the team on Mac had a boot time of 300/400ms.

Therefore, to solve part of this issue, which maybe some of you have noticed, we decided to bundle most of the AdonisJS packages with `tsup`, resulting in fewer files for Node.js to load, thus, a quicker boot time. By bundling most of the packages, we are able to speed up the process by **2 to 3 times**.

### TSX as a template engine
Now, let's talk about TSX. TSX (TypeScript cousin of JSX) files are standard JavaScript modules imported and executed by the Node.js runtime.

Therefore, modifying a TSX file means restarting the process to pick up new changes. This is where the boot time will start to annoy you. Adding a new class to a div and waiting a couple hundred milliseconds to verify the change is not a great developer experience.

The framework users, particularly Estéban, have raised this problem several times. Here's a [discussion thread](https://github.com/adonisjs/core/discussions/4474) for your reference.

### Vite

Finally, as explained in this [article](https://adonisjs.com/blog/future-plans-for-adonisjs-6#adonisjsvite), we've changed our approach with Vite. To summarize, we are launching Vite directly in the main process of AdonisJS rather than as a subprocess.

This means that each time we restart the AdonisJS dev server, we also have to reboot Vite, which has significantly impacted boot time.

---

These are the main reasons that pushed us to implement HMR in AdonisJS. Keeping aside the specifics of AdonisJS, any large application with many dependencies will inevitably suffer from a significant boot time.

The slow boot time is not a problem in production (since the app boots only once). However, it can slow you down in development.

## Existing solutions

Before developing our solution, we looked at what was happening elsewhere.

### Hono / NestJS

[**NestJS proposes Webpack as a solution**](https://docs.nestjs.com/recipes/hot-reload#hot-module-replacement) - So, if you want HMR with NestJS, you must compile your application with Webpack. I don't need to expand much on this because using Webpack to compile a backend application will come with its own set of problems.

[**Hono proposes Vite**](https://github.com/honojs/vite-plugins/tree/main/packages/dev-server) - Hono replaces Webpack with Vite, but the problem remains the same. Introducing a transpiler or a bundler to a backend application is not something we recommend.

The philosophy of AdonisJS has always been to keep things simple. "Use the platform and standard tooling" is our mantra. That's why these existing solutions didn't suit us.

### Bun / Dynohot

Bun comes with [inbuilt support for HMR](https://bun.sh/docs/runtime/hot#hot-mode), and there is [Dynohot](https://github.com/braidnetworks/dynohot), a Node.js loader that enables HMR for applications using ES modules.

Both are great tools but rely on code transformations to achieve HMR. The following is an example of a module that is transformed by Dynohot to achieve HMR.

Here is the code written by you 👇

```ts
import { importedValue } from "./a-module";
export const exportedValue = "hello world";

console.log(importedValue);
```

Here is the transformed output 👇

```ts
import {
  acquire
} from ["hot:runtime"](hot: runtime);
import _a_module from ["hot:module?specifier=./a-module"](hot: module ? specifier = . / -a - module);

function* execute(_meta, _import) {
  let _$ = yield [
    next => {
      _$ = next
    },
    {
      exportedValue: () => exportedValue
    },
  ];
  yield;
  the exportedValue = "hello world";
  console.log(_$.importedValue());
}
module().load({
    async: false,
    execute
  },
  null,
  false,
  "module", {},
  [{
    controller: _a_module,
    specifier: "./a-module",
    bindings: [{
      type: "import",
      name: "importedValue",
    }],
  }],
);
export default function module() {
  return acquire("file:///main.mjs");
}
```

More or less, the same approach is followed by Bun [as seen here](https://stackoverflow.com/questions/73208846/hot-reload-hmr-with-bun-dev).

Their approach allows them to have better control over HMR and do more things. However, this results in compiled code that radically differs from the original. And in the case of Dynohot, it forces you to install quite heavy dependencies like `@babel/traverse` and `@babel/generator`.

Again, to keep things simple, we needed a different approach.

## Hot Hook

So, we finally decided to create our solution - [Hot Hook](https://github.com/julien-R44/hot-hook). Hot Hook theoretically works with any framework and does not perform any static analysis or code transformations. It registers itself as a [Node.js loader hook](https://nodejs.org/api/module.html#customization-hooks) to intercept imports and perform its magic 😇.

:::note

**What is a loader hook?** Loader hooks are actions that sit between your code and the Node.js ES modules loader implementation. You can use these actions to perform code transformations or rewrite import URLs.

For example, `ts-node` [exposes a loader hook](https://github.com/TypeStrong/ts-node/blob/main/esm.mjs#L7) to compile TypeScript code to JavaScript before handing it over to the Node.js for execution.
:::

Okay, now we know that Hot Hook is registered as a loader hook. Here's what happens under the hood.

We start by creating a dependency tree of modules, which looks similar to the following image.

![dump viewer](hot-hook-dependency-graph.png)

> This screenshot is generated using the [@hot-hook/dump-viewer](https://www.npmjs.com/package/@hot-hook/dump-viewer) package.

We keep a version number for every module intercepted by Hot Hook. When you modify a file, Hot Hook detects this change (using a file watcher) and increments the version number associated with that file.

Then, the next time that same file is imported, Hot Hook will intercept the import and add the version number as a query string to the module file URL.

In a nutshell, the URL of the following import:

```ts
import('#controllers/users_controller')
```

Will be transformed into this.

```ts
import('#controllers/users_controller?version=2')
```

By doing this, we bypass the Node.js cache and import the latest version of the module.

To learn more about the internals, feel free to read the package's [README](https://github.com/Julien-R44/hot-hook).

## Memory leaks

There's a problem with the query param approach to cache busting. There have been many discussions on this subject ([nodejs/node#49442](https://github.com/nodejs/node/issues/49442), [nodejs/help#2806](https://github.com/nodejs/help/issues/2806)) and it is currently the only way to bust the cache in ESM (or bypass the cache to be technically correct). The problem with this solution is that it causes memory leaks.

Memory leaks sound like a scary term, and in fact, they are. However, in this case, they're not that bad for the following reasons.

- The memory leak only happens during development because Hot Hook is not used in production.

- These memory leaks are minor. In our internal testing, we noticed the memory consumption increasing by 10-20 MB after multiple days of continuous development.

- Also, whenever you install a new package or modify a config file, we perform a full restart of the process. This will reset the memory consumed by the modules' cache.

## Limitations

Currently, Hot Hook works only with dynamic imports and not with top-level imports. However, dynamic imports (known as boundaries) can have top-level imports, and they will benefit from HMR.

For example, if you import a controller using the `import` statement (as shown in the following example), it will not be hot reloaded.

```ts
// ❌ Cannot hot-reload this
import UsersController from '#controllers/users_controller'

router.get('/users', [UsersController, 'index'])
```

However, if we replace the import expression with a dynamic import using a function, then your controller and its imports will be hot reloaded.

```ts
// delete-start
import UsersController from '#controllers/users_controller'
// delete-end
// insert-start
// ✅ Can be hot-reloaded
const UsersController = () => await import('#controllers/users_controller')
// insert-end

router.get('/users', [UsersController, 'index'])
```

## How AdonisJS architecture is perfect for Hot Hook

As we have just seen, Hot-hook will only work with dynamic imports. Which ultimately is a good thing. Splitting your application with dynamic imports is a very good practice, and luckily, that's what we've been doing in AdonisJS for years.

Using top-level imports everywhere in your backend application will inevitably cause a problem, regardless of the framework you use. The problem is that Node.js will have to load your entire application from the start when you boot it, which can take a lot of time.

Meanwhile, with dynamic imports, all the code hidden behind these imports will be loaded by Node.js only when necessary.

In fact, in AdonisJS, we strongly recommend using dynamic imports for controllers (we even have an [eslint rule](https://docs.adonisjs.com/guides/tooling-config#eslint-config) that auto-fixes this). So, a `UsersController` (and all its dependencies; imagine a `UserService` and a `UserRepository`) will be loaded by Node.js ONLY when we call the `/users` endpoint. If we never call this endpoint, then the `UsersController` will never be loaded by Node.js.

The middleware, exception handler, event listeners, and bouncer policies follow the same approach. **We lazy import every part of your codebase, so when using Hot Hook, you will not have to change a single line of code in your application**.

## Conclusion

That's all for this lengthy article!

We are super excited about HMR. It seems like we have got a perfect combination of simplicity and better developer experience with this addition.

We are looking forward to reading your feedback and hope you will enjoy HMR as much as we do. If you encounter any problems, don't hesitate to open an issue or come and discuss it on [Discord](https://discord.gg/vDcEjq6).
