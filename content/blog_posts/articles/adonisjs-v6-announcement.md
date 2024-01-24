---
summary: The long-awaited version of AdonisJS is finally here. In this post, we cover the highlights of the release.
---

Alright, sit tight, as this will be a long article. The work for v6 started with the goal of moving to ESM and improving the IoC container to be simple and [have fewer responsibilities](https://github.com/adonisjs/fold/releases/tag/v9.0.0-0).

But we have touched almost every part of the framework, smoothing out many rough edges, fixing some long pending issues, and rewriting some packages from scratch. 

:::note

**Are you looking to migrate your applications from v5 to v6?** Check out the [migration-to-v6.adonisjs.com](https://v6-migration.adonisjs.com/guides/introduction) website for a complete list of breaking changes.

Also, we have created a [migration CLI](https://v6-migration.adonisjs.com/guides/upgrade-kit) that can handle the majority of migration work for you.

:::


:::applaud

Before we move forward, I will give a huge shoutout to everyone who [sponsored me on GitHub](http://github.com/sponsors/thetutlage). Your financial support helped me stay focused and make this release possible.

:::

## Moving to ESM

ESM (ECMAScript Modules) vs CJS (CommonJS) might be a topic of debate among many JavaScript developers. But we are not here to discuss the merits and drawbacks of one or the other.

**We went with ESM because it is part of the spec**. Yes, CJS might live the entirety of this universe, but the fact that a project using CJS cannot easily import ESM modules is a big enough pain point for us.

Many prolific authors (whom we rely on) already started moving their packages to ESM. As a result, if we keep the AdonisJS source code in CJS, we cannot use the latest versions of their packages, which may also contain several security fixes.

Starting from v6, every new AdonisJS application will use TypeScript and ESM. Yes, you can still install and use packages written in CJS, as ESM allows that.

## Stop relying on TypeScript compiler hooks

I am not a fan of hacking into tools, primarily when the code is written for public consumption. However, with AdonisJS v5, we hook into the TypeScript compiler API and rewrite the imports prefixed with the `@ioc` keyword to IoC container lookup calls.

For example, if you write the following import.

```ts
import Route from '@ioc:Adonis/Core/Route'
```

We will compile it to 

```ts
const Route = global[Symbol.for('ioc.use')]('Adonis/Core/Route')
```

There are two problems with the above transformation.

- We rely on the official compiler API. As a result, we cannot use other JIT tools like ESBuild or SWC written in other faster languages.
- We have to inject a global IoC container variable to resolve the module from the container.

Do not worry if you do not understand the container usage in this example. We have removed all this magic, and imports in v6 are regular JavaScript imports.

If you have been using AdonisJS v5 for a long time, wonder what happened to `@ioc` prefixed imports. Remember, there were better ways to resolve dependencies from the container. We have found a much simpler way to resolve container dependencies [in the form of container services](https://docs.adonisjs.com/guides/container-services).

## Type-safe routes and controllers binding

Earlier, we used magic strings to bind a controller to a route. For example, This is how the route + controller usage looks in v5.

```ts
Route.get('posts', 'PostsController.index')
```

The `'PostsController.index'` is a magic string because, for TypeScript, it has no real meaning and cannot detect and report errors.

Starting from v6, we no longer recommend using magic strings. You can directly import controllers and bind them on a route by reference. For example:

```ts
import PostsController from '#controllers/posts_controller'

router.get('posts', [PostsController, 'index'])
```

However, there was one nice thing about magic strings. They allowed us to import the controllers lazily. Since controllers import the rest of the codebase, importing them within the routes file impacts the application's boot time.

In v6, you can lazily import a controller by wrapping it inside a function and using dynamic import.

You can detect and automatically convert controller imports to a lazy import using our [ESLint plugin](https://github.com/adonisjs/tooling-config/tree/main/packages/eslint-plugin).

```ts
// delete-start
import PostsController from '#controllers/posts_controller'
// delete-end
// insert-start
const PostsController = () => import('#controllers/posts_controller')
// insert-end

router.get('posts', [PostsController, 'index'])
```

## Type-safe named middleware reference

In AdonisJS v5, you reference the named middleware defined inside the `start/kernel.ts` file on a route as a string. For example:

```ts
Server.middleware.registerNamed({
  auth: () => import('App/Middleware/Auth')
})
```

```ts
Route
  .get('/me', () => {})
  .middleware('auth')
  
// Passing options
Route
  .get('/me', () => {})
  .middleware('auth:web,api')
```

Since we are referencing the middleware as a string and passing the options as a string, there is no type-safety.

Starting from v6, the named middleware are defined by reference using the `middleware` collection exported from the `start/kernel.ts` file.

```ts
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware')
})
```

```ts
import { middleware } from '#start/kernel'

router
  .get('/', () => {})
  .use(middleware.auth())

// Passing options
router
  .get('/', () => {})
  .use(middleware.auth({
    guards: ['web', 'api']
  }))
```

## Type-safe AdonisRC file

We have moved from a JSON-based RCFile (`.adonisrc.json`) to a TypeScript-based RCFile (`adonisrc.ts`).

This change allows us to directly import [service providers](https://docs.adonisjs.com/guides/fundamentals/adonisrc-file#providers), [commands](https://docs.adonisjs.com/guides/fundamentals/adonisrc-file#commands), and [preload files](https://docs.adonisjs.com/guides/fundamentals/adonisrc-file#preloads) instead of defining their import path as strings.

As a result, TypeScript can detect and report broken imports. Also, you can have better IntelliSense when modifying the values in the RCFile.

## Type-safe Event emitter

To make the event emitter type-safe, we define a list of known events as a TypeScript interface, and from thereon, the emitter API only allows dispatching and listening for known events.

```ts
interface EventsList {
  'user:registered': User,
  'http:request_completed': {
    duration: [number, number],
    ctx: HttpContext
  }
}
```

The ability to define an events list as an interface also exists with the older version of AdonisJS.

However, with v6, you can also **define events as classes**. Class-based events encapsulate the event identifier and the event data within the same class. The class constructor serves as the identifier, and an instance of the class holds the event data. For example:

```ts
// title: Defining event
import type User from '#models/user'
import { BaseEvent } from '@adonisjs/core/events'

export default class UserRegistered extends BaseEvent {
  constructor(public user: User) {} 
}
```

```ts
// title: Listening for class-based event
import emitter from '@adonisjs/core/services/emitter'
import UserRegistered from '#events/user_registered'

emitter.on(UserRegistered, function (event) {
  console.log(event.user)
})
```

```ts
// title: Dispatching class-based event
import UserRegistered from '#events/user_registered'

const user = new User()
UserRegistered.dispatch(user)
```

You can [learn about class-based events](https://docs.adonisjs.com/docs/emitter#class-based-events) in the documentation.

## Vite integration for bundling frontend assets

Vite has become the de facto standard for building frontend applications. With this release, we ship an [official integration for using Vite](https://docs.adonisjs.com/guides/assets-bundling) inside AdonisJS applications.

Also, we no longer recommend using [Webpack Encore](https://github.com/adonisjs/encore) for new projects. However, we will continue to maintain this package for existing v5 applications.

## New scaffolding system and codemods API

The scaffolding system and codemods API are used by the package creators to configure a package or by Ace commands to scaffold a resource.

We have written an [in-depth guide on the same](https://docs.adonisjs.com/guides/scaffolding#configure-command) that you must read to learn more about it.

## New validation library

The current validation module of AdonisJS has served us well, but it desperately needs some improvements. Right now:

- It lacks a union data type. There is no way to validate a field as a string or a number.

- The API to create custom rules is rough. We have witnessed many individuals struggling to create custom rules.

- The state of the package codebase was not great. It made it harder for us to make big changes confidently. A significant rewrite was needed.

Finally, we developed a framework agnostic validation library called [VineJS](https://vinejs.dev/). VineJS will be the official validation system for AdonisJS v6.

VineJS is much faster than the version used in V5, and it's also more comprehensive. It makes it easy to create custom rules and schema types and validate complex schemas.

You can learn more about VineJS in our introduction live stream. https://www.youtube.com/watch?v=YdBt0s8NA4I

### What happens to the old validator?
We will maintain the old validator (without bringing any features) you can use while migrating apps to v6. However, we recommend using VineJS for new applications.

## New and more Framework agnostic packages

Lately, we have decided to extract/create more framework-agnostic packages (wherever possible) with their dedicated documentation websites.

As a result, we are happy to announce that you can use the following packages with any Node.js framework of your choice.

- [**Japa**](https://japa.dev/) - A backend focused testing framework for Node.js.

- [**Edge**](https://edgejs.dev/docs/introduction) - In the age of complex frontend libraries and frameworks, Edge embraces old-school server-side rendering. Edge is a simple, Modern, and batteries-included template engine for Node.js.

- [**VineJS**](https://vinejs.dev/docs/introduction) - VineJS is a data validation library for the Node.js runtime. It is at least 9 times faster than Zod and Yup.

- [**Bento Cache**](https://bentocache.dev/) - Bentocache is a robust multi-tier caching library for the Node.js runtime.

- **[Verrou](https://verrou.dev/docs/introduction)** - Verrou is a library for managing locks in a Node.js application.

## Improved documentation

There were some lapses in AdonisJS's documentation. For example, topics like IoC Container and Service providers were undocumented. Also, some of the guides should have been more comprehensive.

With AdonisJS v6, we have spent significant time covering all the framework aspects within the documentation. Following are some of the newly added topics.

- Documented usage of [IoC container](https://docs.adonisjs.com/guides/ioc-container) and [container services](https://docs.adonisjs.com/guides/container-services).

- Dedicated reference section for [Edge helpers](https://docs.adonisjs.com/guides/edge-reference), [available commands](https://docs.adonisjs.com/guides/commands-reference), [events](https://docs.adonisjs.com/guides/events-reference), and [exceptions list](https://docs.adonisjs.com/guides/exceptions-reference).

- Extensive documentation for [creating](https://docs.adonisjs.com/guides/ace-creating-commands) and [testing](https://docs.adonisjs.com/guides/command-line-tests) commands using Ace.

- Dedicated guide for [extending the framework](https://docs.adonisjs.com/guides/extend-adonisjs).

- [HTTP introduction guide](https://docs.adonisjs.com/guides/http) explaining the flow of an HTTP request.

- Dedicated guide for the [BodyParser middleware](https://docs.adonisjs.com/guides/bodyparser-middleware).

- Detailed guide for middleware, covering topics like [mutating response](https://docs.adonisjs.com/guides/middleware#mutating-response-from-a-middleware), [exception handling](https://docs.adonisjs.com/guides/middleware#middleware-and-exception-handling), and [testing middleware](https://docs.adonisjs.com/guides/middleware#testing-middleware-classes) in isolation.

## Better testing experience

We keep testing as one of the top priorities of the framework. Not only do we pre-configure a testing environment for your applications, but we also ensure the core APIs for the framework are testing-friendly.

Starting from v6, we ship:

- First-class assertion APIs for [testing emitted events](https://docs.adonisjs.com/guides/emitter#events-assertions).

- Ability to test ace commands, write assertions for [logger output](https://docs.adonisjs.com/guides/command-line-tests#testing-logger-output), and [trap prompts](https://docs.adonisjs.com/guides/command-line-tests#trapping-prompts).

- Fake outgoing emails and [write assertions](https://docs.adonisjs.com/guides/fake-mailer#assert-email-was-not-sent) against them.

- Support for writing [Browser tests](https://docs.adonisjs.com/guides/fake-mailer#assert-email-was-not-sent) using Playwright.

- And, a [dedicated VSCode extension](https://marketplace.visualstudio.com/items?itemName=jripouteau.japa-vscode) to run Japa tests without leaving your code editor.

## Changes to the folder structure

While 80% of the folder structure of a v6 application remains the same, we move from `PascalCase` to `snake_case` for naming files and folders.

**Why `snake_case`?** - Last year, I documented the rules and conventions I follow when writing code. I briefly talk about the [reasons behind opting for `snake_case`](https://github.com/thetutlage/meta/discussions/3#:~:text=APIs%20as%20well.-,File%20structure%20naming%20conventions,-I%20used%20all).

:::note

The `snake_case` naming convention is part of the official starter kits. However, you have the freedom to create and use custom starter kits with the naming conventions of your choice.

:::

The rest 20% of folder structure changes include:

- Move entry point files to the `bin` folder. You will no longer see `server.ts` and `test.ts` inside the application's root. These files are now inside the `bin` directory.

- Remove the `.adonisrc.json` file in favor of the `adonisrc.ts` file. [Learn more]().

- Rename the `contracts` directory to `types`.

- Move the `Controllers` directory outside the `Http` directory. As a result, there is no `Http` directory in a v6 app. Controllers live directly inside the `app` directory. 

- Move the `env.ts` file from the project root to the `start` directory.

## MJML support and additional mail transports

The `@adonisjs/mail` package now bundles additional transports for [Resend](https://resend.com/) and the [Brevo](https://brevo.com/) mail services. Additionally, it contributes the `@mjml` Edge tag to write email content using the [MJML markup language](https://npmjs.com/mjml).

The contents of the following template will be auto-compiled to HTML on the fly when sending the email. [Learn more](https://docs.adonisjs.com/guides/mail-message#using-mjml-for-email-markup)

```edge
@mjml()
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text>
            Hello World!
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
@end
```

## Sunsetting packages

The following packages are no longer used with a brand new AdonisJS v6 application.

- Remove `@adonisjs/encore` in favor of Vite. However, the package is compatible with v6 and can be used until you decide to move to Vite.

- Remove `@adonisjs/validator` in favor of VineJS. However, the package is compatible with v6 and can be used until you decide to move to VineJS.

- Remove `@adonisjs/sink` in favor of the new scaffolding system and code mods API. No longer support v6 applications.

- Remove `@adonisjs/require-ts` in favor of TSNode + SWC. No longer support v6 applications.

- Remove `@adonisjs/view` in favor of directly using Edge.js. No longer support v6 applications.

## Other changes

Following is the list of additional notable changes in the v6 release.

- Support loading additional dot-env files other than the `.env` file. [Learn more](https://docs.adonisjs.com/guides/environment-variables#all-other-dot-env-files)

- The `@adonisjs/logger` package uses the latest version of Pino and supports defining multiple loggers. [Learn more](https://docs.adonisjs.com/guides/logger)

- Support for experimental `partitioned` and `priority` cookie options.

- Remove support for serving static files from the framework core in favor of the new [@adonisjs/static](https://github.com/adonisjs/static) package.

- Remove support for CORS from the framework core in favor of the new [@adonisjs/cors](https://github.com/adonisjs/cors/releases) package.

## Ready to get started
Head to the [official documentation](https://docs.adonisjs.com/) to learn more about AdonisJS and create a new project. Or check out the [Let's Learn AdonisJS 6](https://adocasts.com/series/lets-learn-adonisjs-6) course from **Tom at Adocasts**.

## Additional Links

- [v5 Documentation](https://v5-docs.adonisjs.com)
- [v6 Migration guide](https://v6-migration.adonisjs.com/guides/introduction)
- [Official and community packages collection](https://packages.adonisjs.com/)
