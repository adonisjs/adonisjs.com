---
summary: We’ve spent four years in the AdonisJS v5 era, and it’s time to move to the AdonisJS v6 era with some fresh ideas.
---

If you have been following us on Twitter, you might have seen us talking about AdonisJS v6 - “A new major version of the AdonisJS framework”. We’ve spent four years in the AdonisJS v5 era, and it’s time to move to the AdonisJS v6 era with some fresh ideas.

But don’t worry. Migrating your apps to AdonisJS v6 will be easy. It might take a few hours or a couple of days, depending on the size of your application. We will also provide a command line tool to help move your code to the new version.

AdonisJS is a modular framework with a feature-rich core (i.e., the `@adonisjs/core` package) and a collection of officially maintained packages. Each package follows its own release cycle and semver versioning. We are significantly updating the framework core in this release (i.e., AdonisJS v6).

The main goal of this update is to work more closely with the platform. We want to use new features of JavaScript and Node.js, ensure your apps have better type safety, and keep improving the framework performance.

## Updating minimum requirements

Because we’re using new features from Node.js, your system needs to have at least Node.js version 18 or higher. This version is the current  [Long-Term Support release](https://github.com/nodejs/Release).

:::note

You can easily manage and upgrade your Node.js version with tools like  [Volta](https://docs.volta.sh/guide/getting-started).

:::

## Switching to ECMAScript Modules (ESM)

The most significant change in this update is that we’re moving to ECMAScript modules (ESM). Right now, AdonisJS uses and compiles to CommonJS (CJS) format. Moving to ESM lets us use new language features and stay updated with the ecosystem.

### What does this mean for your app?

Your apps will be able to use the new platform features that work in ESM, like the  [Top-Level-Await statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#top_level_await)  and  [Node.js subpath imports](https://nodejs.org/api/packages.html#subpath-imports).

The good part is ESM applications can load and use CommonJS packages. But not the other way around. Therefore moving to ESM is a must.

## New asset bundler

Many of you have asked for this, so we’re excited to announce that AdonisJS 6 will include  [Vite](https://vitejs.dev/)  as the default asset bundler.

:::note

We will continue to maintain the Webpack Encore as well. Therefore, if you are not ready to move to Vite, you can use Webpack Encore.

:::

## Better documentation

There are some lapses in the current documentation of AdonisJS. For example, topics like IoC Container, Service providers, and Package development are undocumented. Also, the docs should be more comprehensive.

With AdonisJS v6, we have spent significant time covering all the framework aspects within the documentation. Here's a sneak-peak of **some newly added topics.**

![new_topics_sneak_peak 2](https://github.com/adonisjs/core/assets/2793951/015a5004-8e87-4c35-b351-47c56904ab00)

- The fundamentals section covers the usage of IoC Container, service providers, and package development in-depth.
- Ace documentation is rewritten from scratch covering everything you need to know when creating custom ace commands.
- The testing section includes documentation for **browser testing (via Playwright)** and **command-line testing**.

An important thing to note is that the documentation is a reference guide explaining how the framework works and the available APIs. We imagine the framework users reference documentation when they want complete information about a topic.

The documentation will not teach you how to build an app from scratch.  For that, we plan to write step-by-step tutorials that teach you how to build a specific app using the framework.

In the meanwhile, let us introduce you to [Adocasts](https://adocasts.com/) and [AdonisJS Mastery](https://adonismastery.com/) if you want tutorial-based learning content. Both of these platforms have been creating content on AdonisJS for years.

## Changes to the import module names

As of today (i.e., AdonisJS v5), you will witness many imports prefixed with the `@ioc` keyword. For example, The router is imported from the `@ioc:Adonis/Core/Route` module and the Event emitter is imported from the `@ioc:Adonis/Core/Event` module.

The `@ioc` keyword is a convention we follow to communicate that this import will be resolved from the IoC Container of AdonisJS. When you compile your code from TypeScript to JavaScript, we use a [TypeScript transformer](https://github.com/adonisjs/ioc-transformer) to convert this import into an IoC Container lookup method call.

For instance, if you were importing the Route module like this.

```ts
import Route from '@ioc:Adonis/Core/Route
```

The compiled output will roughly look as follows.

```ts
const Route_1 = global[Symbol.for('ioc.use')]("Adonis/Core/Route")
```

Taking this approach has some downsides.

1. You must always compile your code using the TypeScript official compiler because the transformer was written for `tsc` only.
2. The import syntax is unfamiliar to a JavaScript developer's eye.
3. Developers had to write module definitions separately from the implementation.
4. Users cannot `CTRL-click` the import to see the implementation.

Starting with v6, we will remove `@ioc` keyword imports with regular ESM imports and still be able to look up dependencies inside the AdonisJS dependency container.

Here's what the router import looks like in both v5 and v6. In v6, if you `CTRL+click` on the `router` value, you will see a standard JavaScript module resolving the singleton router instance from the IoC Container and exporting it as a variable.

```ts
# In v5
import Route from '@ioc:Adonis/Core/Route'

# In v6
import router from '@adonisjs/core/services/router'
```

To conclude, in v6, there are no compiler magic converting imports to IoC Container lookup method calls. Everything is straightforward and easy to reason about.

You can learn more about the AdonisJS IoC Container used in v6 from the following links.

- IoC Container package [README file](https://github.com/adonisjs/fold/tree/next).
- An article covering [Why you need an IoC container?](https://github.com/thetutlage/meta/discussions/4)
- [Live stream](https://www.youtube.com/watch?v=XXBwZiIQB98) We did showcase the AdonisJS IoC Container outside of an AdonisJS app.

## New Encryption module

AdonisJS encryption module currently encrypts data using a single static algorithm, i.e., `aes-256-cbc`. We have received a few requests to support additional algorithms in the form of drivers.

AdonisJS v6 will allow you to register custom encryption drivers, and we will bundle drivers for the following encryption algorithms.

- `aes-256-cbc`
- `aes-256-gcm`
- `chacha20-poly1305`

## Changes to file system naming conventions

Moving forward, the AdonisJS official starter kits will use the `snake_case` format for naming files and folders. Currently (in v5), we use `lowercase` names for root-level directories and `PascaleCase` for sub-directories.

In the JavaScript ecosystem, there is no general agreement on naming conventions. Some sub-communities use `PascalCase` for files that export a class and `snake_case` or `dash-case` for files that export functions or objects.

We decided to take a simple approach and consistently name all files and folders without relying on what is exported from the file. The `snake_case` format is inspired from [Dart](https://dart.dev/effective-dart), and [Google TypeScript style guide](https://google.github.io/styleguide/tsguide.html).

To learn more about this decision, check out the article “[List of rules and conventions I follow when writing code](https://github.com/thetutlage/meta/discussions/3)” by Aman Virk.

## Flexible stub system

The scaffolding ace commands under the `make` namespace are used to create files with the initial boilerplate quickly. For example, You can use the `make:controller` command to create a controller, the `make:model` command to create a model, and so on.

Until now, the templates used by these commands were within the package's source code, and there was no way to customize them.

Moving forward (with V6), you can eject the scaffolding templates (stubs) to your application codebase and modify them per your requirements. Next time, when you run the `make` commands, AdonisJS will use the ejected template.

Here's what the controller template looks like.

```hbs
{{#var controllerName = generators.controllerName(entity.name)}}
{{#var controllerFileName = generators.controllerFileName(entity.name)}}
---
to: {{ app.httpControllersPath(entity.path, controllerFileName) }}
---
// import { HttpContext } from '@adonisjs/core/http'

export default class {{ controllerName }} {
}
```

- We use the `generators` object to define variables in the first two lines.
- From lines `3-5`, we use the YAML front matter to define the destination path of the file we are about to create. This will allow you to create controllers and models in any directory of your choice.
- And finally, we define the initial content of the controller.

## New Validation Library

The current validation module of AdonisJS has served us well, but it desperately needs some improvements. Right now:

- It lacks a union data type. There is no way to validate a field as a string or a number.
- The API to create custom rules is rough. We have witnessed many individuals struggling to create custom rules.
- The state of the package codebase was not great. It made it harder for us to make big changes confidently. A significant rewrite was needed.

Finally, we developed a framework agnostic validation library called [VineJS](https://vinejs.dev/). VineJS will be the official validation system for AdonisJS v6.

VineJS is much faster than the version used in V5, and it's also more comprehensive. It makes it easy to create custom rules, schema types and validate complex schemas.

You can learn more about VineJS in our introduction live stream.  [https://www.youtube.com/watch?v=YdBt0s8NA4I](https://www.youtube.com/watch?v=YdBt0s8NA4I) 

:::note

You can continue to use the existing validation module in your v6 projects. There is no need to migrate immediately to VineJS.

In fact, you can use VineJS and the existing validation module together in an AdonisJS application. This will allow you to migrate one validator at a time.

:::

## Other Changes

Numerous other changes have been made for the release of AdonisJS 6, both in the core and in some modules.

Following are some highlights:

- The VSCode extension has been completely revamped to work with AdonisJS 5 and AdonisJS 6. It introduces new features, such as **Inertia support**, **component-as-tag support** in Edge, and **auto-fixable** issues.
- The new core will also use the latest version of `pino`, the logging package. This allows you to make the most of worker threads to enhance performance.
- The new router will allow you to import controllers and bind them directly to a route. The string-based controller reference is still there but not recommended. Importing and binding controllers directly provides better type-safety and refactoring capabilities.
- The new event emitter lets you declare events with classes for better type-safety and refactoring capabilities.
- The new mail module will include drivers for `sendingblue` and `resend`.

All these updates are designed to help you write better, more efficient, and safer code with AdonisJS v6.

## The present and the future

We have completed all the changes in the framework core and are ready to migrate official packages to work with AdonisJS v6. 

We will not introduce any breaking changes in our official packages. The goal is to keep the breaking changes' surface area as small as possible and help you quickly migrate your apps to v6.

## Conclusion

To conclude, the goal of AdonisJS v6 is to remove magic and stay up to date with the language and the platform changes. 

We want to make AdonisJS a more robust, efficient, and developer-friendly framework. Trust us; we are so happy with v6 internally and super pumped to release it. Let me share screenshots of an internal conversation we had.

![chat_between_us](https://github.com/adonisjs/core/assets/2793951/3075203c-ef4b-4a15-a65d-8639b1bef594)

Finally, we thank everyone for using AdonisJS and for sharing their feedback. Having the motivation and energy to work on the framework comes directly from all of you.
