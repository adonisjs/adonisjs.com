---
summary: Recap of the improvements, bug fixes, and documentation updates made during February 2024
---

It's been a month since the major release of AdonisJS v6, and we had a lot going on during this month. Some of the work has been shipped, and some are under the experimental phase and will be released soon.

So, let's recap and highlight all the important changes.

## Shipping limiter

The AdonisJS limiter package is used to apply rate limits on HTTP requests or general on any given action. 

The rate limiter package was incompatible with `v6` during the initial launch. However, you can start using the limiter now with new AdonisJS applications. Following are the links to the release notes and documentation.

- [Release notes](https://github.com/adonisjs/limiter/releases/tag/v2.1.0)
- [Documentation](https://docs.adonisjs.com/guides/rate-limiter)

## Adding back database testing utilities

The utilities to `migrate`, `seed`, and `truncate` database tables during tests were missing during the `v6` initial launch. They have been added back, and you can find the links to the release notes and documentation below.

- [Release notes](https://github.com/adonisjs/lucid/releases/tag/v20.1.0)
- [Documentation](https://docs.adonisjs.com/guides/database-tests)

## A new ace command to install and configure packages
A small quality of life improvement to install and configure AdonisJS packages using a single `node ace add` command.

Right now, if you want to use an AdonisJS-specific package, the workflow for configuring it might look as follows.

```sh
npm i <package-name>
```

```sh
node ace configure <package-name>
```

There is nothing unusual about this workflow. However, improving it a little won't hurt either. Therefore, we have added a new `add` command that performs both steps together.

The command will auto-detect the package manager used by your application and will use it for the installation. You can learn more about it in the [documentation](https://docs.adonisjs.com/guides/commands-reference#add).

```sh
node ace add <package-name>
```

## Adocasts screencasts go public

[![](./adocasts-banner.jpeg)](https://adocasts.com/series/lets-learn-adonisjs-6)

The first **29 lessons out of 40** on [Let's Learn AdonisJS 6
](https://adocasts.com/series/lets-learn-adonisjs-6) series on Adocasts are now publicly available for free. If you have been waiting to take your first steps with AdonisJS, these screencasts are for you.

## Notable Releases

<div class="links_list">

- **New codemods APIs, ace add command, and experimental assembler hooks**\
  https://github.com/adonisjs/core/releases/tag/v6.3.0

- **Bug fixes with the `@adonisjs/logger` package**\
  https://github.com/adonisjs/logger/releases/tag/v6.0.2

- **Breaking - Switch the default naming strategy on models to `camelCase`**\
  https://github.com/adonisjs/lucid/releases/tag/v20.0.0

- **Rewrite the `ace.js` file when creating the production build**\
  https://github.com/adonisjs/assembler/releases/tag/v7.1.1

- **Create access tokens table migration when configuring auth package**\
  https://github.com/adonisjs/presets/releases/tag/v2.2.4

- **Add support for defining multiple CC and BCC addresses when sending emails**\
  https://github.com/adonisjs/mail/releases/tag/v9.2.0

- **Fix stubs exports parser and create CLI command names in dash-case**\
  https://github.com/adonisjs/application/releases/tag/v8.0.3

- **Add Basic Auth guard to the auth package**\
  https://github.com/adonisjs/auth/releases/tag/v9.1.0

- **Add/Export ResponseStatus enum to use descriptive labels for response statuses**\
  https://github.com/adonisjs/http-server/releases/tag/v7.1.0

</div>

## Notable documentation improvements

<div class="links_list">

- **Document how the `authFinder` mixin hashes user passwords**\
  https://github.com/adonisjs/v6-docs/commit/50f746414546370816ad1b8ccf33934f5fe11801

- **Document usage of the Initialize bouncer middleware**\
  https://github.com/adonisjs/v6-docs/commit/0912db42d5165fc2efa6c2a998100a6faf8239f6

- **Document usage of the Initialize Auth middleware**\
  https://github.com/adonisjs/v6-docs/commit/ae98fdb9d18d03209f8525f527451e5764e2e831

- **Document usage of environment variables with the session package**\
  https://github.com/adonisjs/v6-docs/commit/3b29f69a0a1e4eb98560a9c72e5e2ce45693d05e

- **Document the rewrite of the `ace.js` file during the build process**\
  https://github.com/adonisjs/v6-docs/commit/3f30a220ee177e3bd1274479fb733c949ce8e080

</div>

## Published articles

<div class="links_list">

- **Use TSX for your template engine**\
  https://adonisjs.com/blog/use-tsx-for-your-template-engine

- **Setting up Kysely inside an AdonisJS project**\
  https://adonisjs.com/blog/kysely-with-adonisjs

- **Future plans for AdonisJS v6**\
  https://adonisjs.com/blog/future-plans-for-adonisjs-6

- **Integrating Kysely with the Auth session guard**\
  https://adonisjs.com/blog/kysely-with-auth-session-guard

</div>

## In case you missed

<div class="links_list">

- **Directory to explore all official and community packages built for AdonisJS**\
  https://packages.adonisjs.com/

- **The AdonisJS Lucid filter package is now compatible with v6**\
  https://github.com/lookinlab/adonis-lucid-filter

- **The AdonisJS credentials package is now compatible with v6**\
  https://github.com/bitkidd/adonisjs-credentials

- **The AdonisJS Redis RPC package is now compatible with v6**\
  https://github.com/Craftnotion/adonis-advance-redis-rpc

- **AdonisJS benchmarks on Web Frameworks Benchmark**\
  https://web-frameworks-benchmark.netlify.app/result?l=javascript

</div>
