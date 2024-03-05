---
summary: Experimental release for the Inertia adapter for AdonisJS. Also come with a new release of our Vite integration.
---

We are pleased to announce that the Inertia adapter for AdonisJS is now available as an experimental version! Also, note that we have **full SSR support**.

By experimental version, we mean that the adapter is ready to be used and functional, but we're waiting for your feedback to stabilize certain APIs and fix some bugs. Breaking changes will likely occur, but they will be minor if they do.

To be more precise, this experimental release concerns several packages and functionalities. In particular, Vite is receiving a significant update. We'll talk more about this in the article, but for now, let's start by explaining the steps you need to follow to try out these new features.

## Try Inertia

### Inertia Starter Kit

To help you get started quickly with Inertia, we've created an [Inertia starter kit](https://github.com/adonisjs/inertia-starter-kit) available via `create-adonisjs`. This starter kit is based on the `web-starter-kit`, i.e., with authentication, database, etc., but also with Inertia. You can to choose your favorite front-end framework (Vue, React, Svelte, Solid) and configure SSR (or not).

```sh
# Run the following command and select the inertia starter kit
npm init adonisjs

# or use arguments to skip the prompts
npm init adonisjs my-app --kit=inertia --framework=solid --ssr
```

You'll have a ready-to-use application with Inertia, with or without SSR, your favorite front-end framework, and all the rest.

We also added a route with an associated example component to show you how to use Inertia. So, you can launch your application, visit `localhost:3333/inertia`, and you'll see Inertia in action.

### Migrate to the experimental version of Vite

If you don't want to use the starter kit, you can migrate to the experimental version of Vite (`npm i @adonisjs/vite@next`) and add Inertia to your existing application.

We have shipped a new version of `adonisjs/vite` that introduces a significant change, explained [in this article](https://adonisjs.com/blog/future-plans-for-adonisjs-6#adonisjsvite).

To recap: before, Vite was launched as a child process by the AdonisJS assembler. Now, Vite is launched directly in the same process as Adonis, which simplifies SSR support. There are no breaking changes in the API, but it is necessary to change some options in the RC file so we can bump the major version safely.

To migrate to the latest version of Vite, you will need to have at least these versions in your `package.json` :

- `@adonisjs/assembler` >= 7.2.3
- `@adonisjs/core` >= 6.3.1
- `@adonisjs/vite` >= 3.0.0-6
- `vite` >= 5.1.4

Once these versions are installed, you'll need to update your `adonisrc.ts` file to disable asset bundling management by the Assembler, and enable experimental hooks:

```ts
export default defineConfig({
  // ...

  // insert-start
  assetsBundler: false,
  unstable_assembler: {
    onBuildStarting: [() => import('@adonisjs/vite/build_hook')],
  },
  // insert-end

  // ...
})
```

As you can see, we are using an `unstable_` flag to enable experimental hooks. This API is open to change in the future without any major release. We are waiting for your feedback to stabilize it. Read more about [Assembler hooks just below](#assembler-hooks)

Once these changes have been made, you can launch your application as usual. Vite will be used to compile your assets.

### Adding Inertia to an existing application

If you already have an AdonisJS application and want to add Inertia without going through the starter kit, you must first migrate to the latest version of Vite, as explained above.

Once you've done that, you can run:

```sh
node ace add @adonisjs/inertia
```

Follow the instructions displayed in the CLI to add the needed files, and you should be ready.

## Major changes

Let's dig deeper into the major changes in the different packages.

### Vite 

As mentioned in [a previous article](./future-plans-for-adonisjs-6.md), we've changed the implementation of our Vite integration. Let's take a quick look at the major changes in this version.

#### Middleware mode 

Previously, Vite was launched as a child process of the AdonisJS assembler. Now, Vite is launched directly in the same process as AdonisJS via a provider. This provider registers a middleware that will enable the AdonisJS server to serve the assets compiled by Vite. This happens only in development.

Having Vite in the same process as AdonisJS greatly simplifies SSR support, as we now have direct access to the Vite API. For more on this subject, please see [the previous article](./future-plans-for-adonisjs-6.md#adonisjsvite).

#### Preload assets

The new Vite version introduces built-in support for asset preloading.

By default, Vite does code splitting, generating multiple small bundles that are loaded progressively as the user navigates the site. While beneficial, this can sometimes lead to a "waterfall" effect:

- We specify `@vite(['resources/js/app.js'])` in our Edge template.
- This file imports other files, such as `.vue` or `.tsx` components, and sometimes CSS.

It will result in a slow process from your browser:

- The browser must discover and parse the `html`.
- Discover the `app.js` script in the HTML and parse it. 
- After parsing, the browser will discover the imports in the `app.js` file.
- Then, it signals the browser to load `components/home.vue` and `app.css`, for example.

This process can be highly optimized using [preload](https://developer.mozilla.org/fr/docs/Web/HTML/Attributes/rel/preload) and [modulepreload](https://developer.mozilla.org/fr/docs/Web/HTML/Attributes/rel/modulepreload) attributes.

In production, Vite generates a Manifest outlining the relationships between our application's various scripts and styles. We can use this manifest to create preload tags for assets and inject them into the HTML.

Preload tags are generated for:

- The entry points and the CSS imported by them.
- The JavaScript imported by these entry points.
- The CSS imported by the JavaScript imported by the entrypoints

**This behavior will be enabled by default with the new `@adonisjs/vite` version.**

You will see a small difference if you use AdonisJS with Edge and a small amount of JavaScript. On the other hand, for applications with a lot of JavaScript, you should see a big improvement when your pages load. For example, here's a before-and-after benchmark on [packages.adonisjs.com](https://packages.adonisjs.com) (built with Inertia):

![Alt text](/before_after_preload.png)

A specific documentation page for the new experimental version of Vite is available [here](https://docs.adonisjs.com/guides/experimental-vite).

### Inertia

The Inertia API on AdonisJS is similar to the community package maintained by [eidellev](https://github.com/eidellev) for V5. So, you shouldn't have too much trouble migrating or using the new version. For more information, consult our [guide](https://docs.adonisjs.com/guides/inertia). 

It only covers the parts specific to AdonisJS, so if you need more general information about Inertia, please consult [their documentation](https://inertiajs.com/).

### Assembler Hooks

Assembler hooks are a way of executing code at specific points in the assembler lifecycle. As a reminder, the Assembler is a part of AdonisJS that enables you to launch your dev server, build your application and run your tests. 

These hooks can be helpful for tasks such as file generation, code compilation, or injecting custom build steps.

Assembler hooks were initially introduced for our new experimental version of Vite. These hooks enable the `@adonisjs/vite` package to customize the build process and inject a step where front-end assets are built, and also, if necessary, generate an SSR build.

This feature is experimental, so we use the `unstable_` prefix. We're waiting for your feedback to stabilize this API. 

You can read the complete documentation [here](https://docs.adonisjs.com/guides/experimental-assembler-hooks).

---

We hope you enjoy these new features as much as we do. Feel free to open issues on the packages' repositories if you encounter any problems or have any suggestions.
