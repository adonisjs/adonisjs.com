Alright, sit tight, as this will be a long article. The work for v6 started with the goal of moving to ESM and improving the IoC container so that it would not be magical.

But we have touched almost every part of the framework, smoothing out many rough edges, fixing some long pending issues, and rewriting some packages from scratch. 



:::note

Are you looking to migrate your applications from v5 to v6? Check out the [migration-to-v6.adonisjs.com]() website for a complete list of breaking changes.

Also, we have created a migration CLI that can handle the majority of migration work for you.

:::


:::applaud

Before we move forward. I will give a huge shoutout to everyone who [sponsored me on Github](http://github.com/sponsors/thetutlage). The financial support from you helped me stay focus and make this release possible.

:::

## Moving to ESM

ESM (ECMAScript Modules) vs CJS (CommonJS) might be a topic of debate among many JavaScript developers. But we are not here to discuss the merits and drawbacks of one or the other.

**We went with ESM because it is part of the spec**. Yes, CJS might live the entirety of this universe, but the fact that a project using CJS cannot easily import ESM modules is a big enough pain point for us.

Many prolific authors (whom we rely on) already started moving their packages to ESM. As a result, if we keep the AdonisJS source code in CJS, we cannot use the latest versions, which may also contain several security fixes.

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

If you have been using AdonisJS v5 for a long time, wonder what happened to `@ioc` prefixed imports. Remember, there were better ways to resolve dependencies from the container. We have found a much simpler way to resolve container dependencies [in the form of container services](https://docs.adonisjs.com/guides/fundamentals/container-services).

> **Bumby road ends here**\
> These are the only destructive changes while moving from v5 to v6. From here on, its going to be a smooth ride with greenery on both the sides.

## Improved type-safety



### Routes and controllers

### AdonisRC file

### Event emitter

## Vite integration for bundling frontend assets

## New scaffolding system and codemods API

## New and more Framework agnostic packages

- Japa
- Edge
- VineJS
- Lucid
- Bento Cache
- Verrou
- Drive (coming soon)

## Improved documentation

## Better testing experience

## Changes to the folder structure

## Improved and simple IoC container

## Secure Authentication layer

## Sunsetting packages

- Webpack Encore
- Validator
- Auth package OAT guard
- AdonisJS sink
- Require TS
- 

## Other changes

- Support loading additional dot-env files other than the `.env` file.
