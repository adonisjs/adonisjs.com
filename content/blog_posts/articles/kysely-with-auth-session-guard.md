---
summary: In this post, we create a custom user provider for authenticating users using the AdonisJS Auth session guard and Kysely.
---

In the last post, we setup [Kysely inside an AdonisJS application](https://adonisjs.com/blog/kysely-with-adonisjs) with commands to make, run, and rollback migrations. In this post, we will take a step ahead and integrate Kysely with the AdonisJS auth package.

If you want to follow along, I recommend first reading the [Kysely setup post](https://adonisjs.com/blog/kysely-with-adonisjs).

## Installing the Auth package

The first step is to install and configure the Auth package. Since we will create a provider for the [session guard](https://docs.adonisjs.com/guides/auth-session-guard), you must configure the package with the `--guard=session` flag.

:::note

The session guard requires the `@adonisjs/session` package. So make sure to configure the [session package](https://docs.adonisjs.com/guides/session#installation) as well.

:::

```sh
npm i @adonisjs/auth
```

```sh
node ace configure @adonisjs/auth --guard=session
```

The initial setup process assumes your application uses Lucid and creates the `User` model and the `users` table migration files. You will have to manually delete these files.

```sh
rm database/migrations/<file_create_by_auth_package>
rm app/models/user.ts
```

## Creating a User provider for the session guard

Let's start by creating the User provider for the session guard. We will store it inside the `app/auth_providers` directory.

```sh
mkdir app/auth_providers
touch app/auth_providers/session_user_provider.ts
```

Open the newly created file and paste the following code inside it. The first step is to create a class that implements the [SessionUserProviderContract](https://github.com/adonisjs/auth/blob/develop/modules/session_guard/types.ts#L153) interface.

```ts
import type { Users } from '../../types/db.js'
import { symbols } from '@adonisjs/auth'
import { SessionUserProviderContract } from '@adonisjs/auth/types/session'

export class SessionKyselyUserProvider implements SessionUserProviderContract<Users> {
  declare [symbols.PROVIDER_REAL_USER]: Users
}
```

- The `SessionUserProviderContract` interface needs a generic User property your guard will accept and return when interacting with the session guard. This generic property adds type safety to your codebase.

- We read the `Users` property from the `types/db.ts` file. This file is created using the [kysely-codegen](https://adonisjs.com/blog/kysely-with-adonisjs#using-kysely-codegen) CLI.

- The `symbols.PROVIDER_REAL_USER` property is used by the event emitter to add type information to the [events emitted by the session guard](https://docs.adonisjs.com/guides/events-reference#session_authlogin_attempted).

### Implementing the createUserForGuard method

The `createUserForGuard` method is a Bridge (or Adapter) between the session guard and your provider. Since the guard is user-agnostic, it needs this adapter to fetch the user's unique ID and store it inside the session.

```ts
import type { Users } from '../../types/db.js'
import { symbols } from '@adonisjs/auth'
import {
  // insert-start
  SessionGuardUser,
  // insert-end
  SessionUserProviderContract
} from '@adonisjs/auth/types/session'

export class SessionKyselyUserProvider implements SessionUserProviderContract<Users> {
  declare [symbols.PROVIDER_REAL_USER]: Users

  // insert-start
  async createUserForGuard(user: Users): Promise<SessionGuardUser<Users>> {
    return {
      getId() {
        return user.id
      },
      getOriginal() {
        return user
      },
    }
  }
  // insert-end
}
```

The `createUserForGuard` must return an object with the following two properties.

- `getId`: The unique ID for the user. Usually, it will be the primary key from the database.
- `getOriginal`: Reference to the user fetched from the database. The return value should satisfy the generic `User` property defined on the `SessionUserProviderContract` interface. 

### Implementing the findById method

The `findById` method is responsible for finding the user by their ID during authentication. This method should return `null` when the user does not exist or return the `SessionGuardUser` object.

```ts
// insert-start
import { db } from '#services/db'
// insert-end
import type { Users } from '../../types/db.js'
import { symbols } from '@adonisjs/auth'
import {
  SessionGuardUser,
  SessionUserProviderContract
} from '@adonisjs/auth/types/session'

export class SessionKyselyUserProvider implements SessionUserProviderContract<Users> {
  declare [symbols.PROVIDER_REAL_USER]: Users

  async createUserForGuard(user: Users): Promise<SessionGuardUser<Users>> {
    return {
      getId() {
        return user.id
      },
      getOriginal() {
        return user
      },
    }
  }
  
  // insert-start
  async findById(identifier: number): Promise<SessionGuardUser<Users> | null> {
    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', identifier)
      .executeTakeFirst()
    if (!user) {
      return null
    }

    return this.createUserForGuard(user)
  }
  // insert-end
}
```

## Configuring the provider inside the config file

As the last step, we must register the `SessionKyselyUserProvider` within the `config/auth.ts` file. By default, the config file uses the `sessionUserProvider` helper from the session package. So, we will have to replace this with our implementation.

```ts
import { defineConfig } from '@adonisjs/auth'
// insert-start
import { configProvider } from '@adonisjs/core'
// insert-end
import { sessionGuard } from '@adonisjs/auth/session'
import { InferAuthEvents, Authenticators } from '@adonisjs/auth/types'

const authConfig = defineConfig({
  default: 'web',
  guards: {
    web: sessionGuard({
      // delete-start
      useRememberMeTokens: false,
      provider: sessionUserProvider({
        model: () => import('#models/user'),
      })
      // delete-end
      // insert-start
      provider: configProvider.create(async () => {
        const { SessionKyselyUserProvider } = await import(
          '../app/auth_providers/session_user_provider.js'
        )
        return new SessionKyselyUserProvider()
      }),
      // insert-end
    }),
  },
})
```

As you notice, we do not import the `SessionKyselyUserProvider` at the top-level of the config file and instead lazy import it using the `configProvider.create` method.

This is because AdonisJS loads the config files at the start of the application, and during that time, your app is not fully ready to interact with other parts of the codebase. You might encounter errors if you import application-level code inside a config file.

Therefore, as a general principle, never import application code inside config files.

## Creating a user
Before we can test our implementation, we need a user inside the database. So let's create one using the [AdonisJS REPL](https://docs.adonisjs.com/guides/repl).

```sh
node ace repl
```

```ts
// Type ".ls" to view a list of available context methods/properties
// > (js)
await import('#services/db')
db = _.db

await loadHash()
```

After importing the `hash` and the `db` services, you can get into the editor mode by typing `.editor` in the REPL and copy-paste the following code.

```ts
// .editor
// Entering editor mode (Ctrl+D to finish, Ctrl+C to cancel)
await db
  .insertInto('users')
  .values({
    email: 'virk@adonisjs.com',
    password: await hash.make('secret'),
    full_name: 'Harminder Virk',
    created_at: new Date().getTime(),
    updated_at: new Date().getTime()
  })
  .execute()
```

Finally, press `Ctrl+D` to execute the code and exit the editor mode.

## Time for the test drive
Now that we have created and registered the User provider with the auth config, we are ready to test-drive it. Let's create the following three routes. 

- The root route is protected using the `auth` middleware and will disallow unauthenticated requests.

- The `/login` route displays the Login form and uses the `guest` route to disallow logged-in users from accessing this page.

- The `POST /login` route will be responsible for creating the authentication session for the user.

```ts
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router.on('/').render('pages/home').use(middleware.auth())
router.on('/login').render('pages/login').use(middleware.guest())

router.post('login', async ({ auth, request, response }) => {
  // Will implement the logic for authentication here.
})
```

```ts
// insert-start
import { db } from '#services/db'
import { errors } from '@adonisjs/auth'
import hash from '@adonisjs/core/services/hash'
// insert-end

router.post('login', async ({ auth, request, response }) => {
  // insert-start
  /**
   * Step 1: Throw an error when the user has not provided the email
   * or the password
   */
  const { email, password } = request.only(['email', 'password'])
  if (!email || !password) {
    throw new errors.E_INVALID_CREDENTIALS('Invalid credentials')
  }

  const user = await db
    .selectFrom('users')
    .selectAll()
    .where('email', '=', email)
    .executeTakeFirst()

  /**
   * Step 2: Throw an error when we are not able to find the user
   * by their email address
   */
  if (!user) {
    throw new errors.E_INVALID_CREDENTIALS('Invalid credentials')
  }

  /**
   * Step 3: Throw an error when the password is incorrect
   */
  const hasValidPassword = await hash.verify(user.password, password)
  if (!hasValidPassword) {
    throw new errors.E_INVALID_CREDENTIALS('Invalid credentials')
  }

  /**
   * Step 4: Finally, log in the user and redirect them to the
   * homepage.
   */
  await auth.use('web').login(user)
  response.redirect('/')
  // insert-end
})
```

Since we are not using Lucid models, we cannot abstract the logic of verifying user credentials to a model method. Instead, we have to write the inline code within the route handler.

1. First, we ensure the user has supplied the `email` and `password`. Otherwise, we should throw the [E_INVALID_CREDENTIALS](https://docs.adonisjs.com/guides/exceptions-reference#e_invalid_credentials) exception.

2. Next, we query the database with the user's email and throw an `E_INVALID_CREDENTIALS` exception when the user does not exist.

3. Next, we verify the user's password with the hash saved inside the database.

4. Finally, we log in using the session guard and redirect the user to the home page.

### Creating the home page
Create the `resources/views/pages/home.edge` file and copy-paste the following code inside it.

```edge
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title> Protected area </title>
</head>
<body>
  <h1> Hello {{ auth.user.full_name }}! </h1>
  <p>You are logged in as {{ auth.user.email }}</p>
</body>
</html>
```

### Creating the login page
Create the `resources/views/pages/login.edge` file and copy-paste the following code inside it.

```edge
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title> Login </title>
</head>
<body>
  @flashMessage('errorsBag')
    @each(error in $message)
      <p>{{ error }}</p>
    @end
  @end

  <form action="/login" method="post">
    <div>
      <label for="email"> Email </label>
      <input type="email" name="email" id="email">
    </div>

    <div>
      <label for="password"> Password </label>
      <input type="password" name="password" id="password">
    </div>

    <div>
      <button type="submit"> Login </button>
    </div>
  </form>
</body>
</html>
```

## Conclusion

In this post, we create a custom user provider for the session guard. Even though we are using Kysely in this example, you can replace the code specific to Kysely with the ORM of your choice.

All you have to do is create a JavaScript class that implements [SessionUserProviderContract](https://github.com/adonisjs/auth/blob/develop/modules/session_guard/types.ts#L153).

```ts
import { symbols } from '@adonisjs/auth'
import { SessionUserProviderContract } from '@adonisjs/auth/types/session'

/**
 * The user type your provider will return
 */
export type User = {}

export class MySessionUserProvider implements SessionUserProviderContract<Users> {
  declare [symbols.PROVIDER_REAL_USER]: User

  /**
   * Create the user adapter that the guard can use
   * to fetch the ID.
   */ 
  async createUserForGuard(user: Users): Promise<SessionGuardUser<Users>> {}

  /**
   * Find a user by their ID
   */
  async findById(identifier: number): Promise<SessionGuardUser<Users> | null> {}
}
```
