---
summary: Recap of the improvements, bug fixes, and experimental packages released in March 2024
---

We are entering a new month, so it is time to reflect back and share updates with you from the last month.

## Github adds syntax highlighting for Edge templates

Github now recognizes the syntax of Edge templates and provides syntax highlighting for them. This contribution is made by **Liam Potter** (a long-time AdonisJS user) via this [PR](https://github.com/github-linguist/linguist/pull/6695).

To enable syntax highlighting, you must set the code block language to `edge`, as shown in the following example.

![](./edge-preview.png)

## Atomic Locks

Julien (from the core team) has created [Verrou](https://verrou.dev/docs/introduction) - **A framework agnostic library for managing distributed locks to prevent race conditions**.

We provide first-class integration with Verrou via the `@adonisjs/lock` package. You can store the locks inside an AdonisJS app within a Redis or SQL database, along with the memory store that can be used during testing.

```ts
import locks from '@adonisjs/lock/services/main'

/**
 * Create a lock instance with a unique key
 */
const lock = locks.createLock(`order.${orderId}.fulfill`)

/**
 * Executed the code by wrapping it inside the
 * "lock.run" method.
 *
 * The callback will be executed only when we are
 * able to acquire a lock
 */
const [executed, result] = lock.run(async () => {
  //Fulfill the order
})

if (executed) {
  return result
}

return 'Unable to fulfill order. Try again after some time'
```

- [Documentation](https://docs.adonisjs.com/guides/locks)
- [Repo](https://github.com/adonisjs/lock)

## InertiaJS adapter (with SSR)

We have finally taken over the development of the InertiaJS adapter (for AdonisJS). The project is led by [Julien Ripouteau](https://twitter.com/julien_rpt), and the first version has been released under the experimental flag.

[InertiaJS](https://inertiajs.com/) can become an excellent alternative for projects that use a frontend framework like Vue or React for the application's UI and create a separate JSON API using AdonisJS.

With InertiaJS, you can remove routing and a lot of state management boilerplate from your frontend apps and keep everything within a single codebase.

So, [try Inertia with our new integration](https://docs.adonisjs.com/guides/inertia) and share your feedback. After smoothing out certain rough edges, we are looking forward to releasing a stable version soon.

- [Documentation](https://docs.adonisjs.com/guides/inertia)
- [Repo](https://github.com/adonisjs/inertia)

## Changes to the Vite integration

To support SSR mode for the InertiaJS application, we need access to Vite APIs within the AdonisJS process to pre-render your React or Vue components on the server and send HTML to the browser.

This requires us to run Vite alongside AdonisJS rather than in a separate process (as we do with the current integration). 

We have released this [new integration under the experimental flag](https://docs.adonisjs.com/guides/experimental-vite) and are looking for feedback from early adopters. Please give this integration a try and report your issues in the [adonisjs/vite](https://github.com/adonisjs/vite) repo.

- [Documentation](https://docs.adonisjs.com/guides/experimental-vite)
- [Repo](https://github.com/adonisjs/vite/tree/next)

## Env identifier

Env identifiers are keywords you can prefix to the value of an environment variable and define value resolution for that keyword. For example, you may create a `file` identifier that resolves the value from the filesystem.

```ts
import { readFile } from 'node:fs/promises'
import { EnvParser } from '@adonisjs/env'

/**
 * Define the identifier
 */
EnvParser.identifier('file', (value) => {
  return readFile(value, 'utf-8')
})
```

Once you have defined the identifier, you can prefix the value of an environment variable with the `file` keyword, and its value will be resolved from the filesystem.

```env
DB_PASSWORD=file:/run/secret/db_password
```

- [Release notes](https://github.com/adonisjs/env/releases/tag/v6.0.0)

## Quality of life improvements for VineJS
We recently added support for [conditional validation](https://vinejs.dev/docs/conditional_validation) in VineJS via the `requiredIf` rules. These rules serve as an alternative to the existing [Vine.union](https://vinejs.dev/docs/types/union) schema type. The `requiredIf` rules offer a terse API at the cost of a less type-safe API.

In the following example, the `firstName` and the `lastName` fields are optional. However, if one is provided, the other should also be required. 

```ts
vine.object({
  firstName: vine
    .string()
    // highlight-start
    .optional()
    .requiredIfExists('lastName'),
    // highlight-end

  lastName: vine
    .string()
    // highlight-start
    .optional()
    .requiredIfExists('firstName'),
    // highlight-end
})
```

- [Documentation](https://vinejs.dev/docs/conditional_validation)
- [Release notes](https://github.com/vinejs/vine/releases/tag/v1.8.0)

### Improved error reporting for fields inside arrays
In the previous versions of VineJS, the errors for fields inside an array used wildcard identifier (*) for the nested field path. For example:

```ts
// Old output
[
  {
    // highlight-start
    field: 'categories.*',
    // highlight-end
    index: 1,
    message: 'The 1 field must be a number',
    rule: 'number',
  },
  {
    // highlight-start
    field: 'categories.*',
    // highlight-end
    index: 2,
    message: 'The 2 field must be a number',
    rule: 'number',
  }
]
```

However, starting from `@vinejs/vine@2`, the value of the `field` property contains the index of the array element for which the validation has failed.

```ts
// New output
[
  {
    // highlight-start
    field: 'categories.1',
    // highlight-end
    index: 1,
    message: 'The 1 field must be a number',
    rule: 'number',
  },
  {
    // highlight-start
    field: 'categories.2',
    // highlight-end
    index: 2,
    message: 'The 2 field must be a number',
    rule: 'number',
  }
]
```

- [Release notes](https://github.com/vinejs/vine/releases/tag/v2.0.0)

## Notable Releases

<div class="links_list">

- **Add step option to the migrator**\
  https://github.com/adonisjs/lucid/releases/tag/v20.5.0

- **Add clause variant to findBy method**\
  https://github.com/adonisjs/lucid/releases/tag/v20.5.1

- **Add support for pretty printing debug queries and findMany helper method**\
  https://github.com/adonisjs/lucid/releases/tag/v20.4.0

- **Fix mail assertion API to allow mail class constructor to accept arguments**\
  https://github.com/adonisjs/mail/releases/tag/v9.2.1

- **Add @errors tag**\
  https://github.com/adonisjs/session/releases/tag/v7.2.0

- **Display validation error summary in flash messages errorsBag**\
  https://github.com/adonisjs/session/releases/tag/v7.3.0

</div>
