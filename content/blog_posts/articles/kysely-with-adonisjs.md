---
summary: This post showcases how we can use the existing primitives of the framework and integrate Kysely inside an AdonisJS application seamlessly.
---

AdonisJS comes pre-configured with our home-grown ORM [Lucid](https://lucid.adonisjs.com/docs/introduction). While Lucid shines on many fronts, it does not have a type-safe API for constructing SQL queries.

Depending on your personal or team preferences, not having end-to-end type safety at the database level can be a deal breaker, and you might want to replace Lucid with another type-safe ORM or a query builder.

## Using Kysely

If your primary goal is a type-safe database layer, then Kysely is your best choice. I have yet to find an ORM or a query builder that provides both type-safe results and a type-safe API for constructing queries.

Since Kysely is a standalone low-level query builder, it does not come with all the bells and whistles you get with Lucid. For example, there is no CLI to manage migrations, models, or opinions on where to store Kysely-specific files.

In this article, we will learn how to take a low-level library like Kysely and integrate it seamlessly into an AdonisJS application.

## Creating a new AdonisJS application

Let's create a new AdonisJS application using the [slim starter kit](https://github.com/adonisjs/slim-starter-kit). I selected the slim starter kit because it does not come with any database layer, giving us a clean surface to configure Kysely.

```sh
npm init adonisjs@latest hello-world -- -K=slim
```

## Installing Kysely and Kysely codegen

I am going to use SQLite in this article. However, you can pick the database dialect of your choice and make necessary changes to the code to make it work with the selected dialect.

```sh
npm i kysely better-sqlite3
npm i -D @types/better-sqlite3

# Need this directory to store the SQLite database
mkdir tmp
```

Also, let's install the [kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen) CLI tool to create TypeScript types by inspecting the database schema. During my testing, I found that `kysely-codegen` has [rough edges](https://github.com/RobinBlomberg/kysely-codegen/issues/70). If you find yourself fighting this tool more than using it, feel free to remove it since Kysely can work without automated type generation.

```sh
npm i -D kysely-codegen
```

## Creating the database service

To make SQL queries with Kysely, you must first create an instance of the [Kysely](https://kysely-org.github.io/kysely-apidoc/classes/Kysely.html). Let's store this inside the `app/services/db.ts` file. 

The `services` folder inside an AdonisJS project is used to create and store arbitrary abstractions of your application. So, it is the perfect place to create and export a database instance.

```sh
mkdir app/services
touch app/services/db.ts
```

```ts
// title: app/services/db.ts
import SQLite from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import app from '@adonisjs/core/services/app'
import type { DB } from '../../types/db.js'

const dialect = new SqliteDialect({
  database: new SQLite(app.makePath('tmp/db.sqlite')),
})

export const db = new Kysely<DB>({
  dialect,
})
```

- First, we create an instance of the `SqliteDialect` (as shown in the [Kysely docs](https://kysely.dev/docs/getting-started?dialect=sqlite#dialects)) and define a path for the SQLite database file. We store the database file inside the `tmp` directory.
-  Next, we create an instance of the `Kysely` class and provide it with the dialect object.
-  The generic `DB` type comes from the `types/db.js` file. We will create the `DB` interface using the `kysely-codegen` CLI. But first, we should create this file and export an empty interface from it.

    ```sh
    mkdir types
    touch types/db.ts
    ```
    
    ```ts
    // title: types/db.ts
    export interface DB {}
    ```

## Creating commands to manage migrations

We can start using Kysely right now. However, building an application from scratch will be easier with a proper workflow for creating and running migrations.

So, let's put in some initial efforts and create a couple of [Ace commands](https://docs.adonisjs.com/guides/ace-creating-commands). We will start with the `make:migration` command.

### The make migration command

The `make:migration` command will use the [scaffolding](https://docs.adonisjs.com/guides/scaffolding) API of AdonisJS to create a new migration file inside the `database/migrations` directory.

```sh
node ace make:command make_migration
# DONE:    create commands/make_migration.ts
```
    
```ts
// title: commands/make_migration.ts
import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class MakeMigration extends BaseCommand {
  static commandName = 'make:migration'
  static description = 'Create a new Kysely migration file'
  static options: CommandOptions = {}

  @args.string({ description: 'Name of the migration file' })
  declare name: string

  async run() {
    const entity = this.app.generators.createEntity(this.name)
    const tableName = this.app.generators.tableName(entity.name)
    const fileName = `${new Date().getTime()}_create_${tableName}_table.ts`

    const codemods = await this.createCodemods()
    await codemods.makeUsingStub(this.app.commandsPath('stubs'), 'make/migration.stub', {
      entity,
      migration: {
        tableName,
        fileName,
      },
    })
  }
}
```

- The `make:migration` command accepts the migration file name as the only argument.
- Next, it uses the [generator module](https://github.com/adonisjs/application/blob/main/src/generators.ts#L91) to define certain variables we need to compute the database table name, the migration file, and so on.
- Finally, we use the `codemods.makeUsingStub` method to generate the migration file.

The `codemods.makeUsingStub` method reads the stub (aka template) from the `commands/stubs/make/migration.stub` file. So, let's create it as well.

```sh
mkdir -p commands/stubs/make
touch commands/stubs/make/migration.stub
```

```js
{{{
  exports({
    to: app.migrationsPath(entity.path, migration.fileName)
  })
}}}
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('{{ migration.tableName }}')
    .addColumn('id', 'integer', (col) => col.primaryKey().notNull())
    .addColumn('created_at', 'timestamp', (col) => col.notNull())
    .addColumn('updated_at', 'timestamp', (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('{{ migration.tableName }}').execute()
}
```

Let's try the `make:migration` command and see if it works as expected. The command should create the migration file within the `database/migrations` directory.

```sh
node ace make:migration users
```

### The migration command

Now that we can create migration files. Let's create another command to execute pending migrations.

The `kysely:migrate` command uses the [Migrator](https://kysely-org.github.io/kysely-apidoc/classes/Migrator.html) class and the Database service from `app/services/db.ts` file to run migrations stored inside the `database/migrations` directory.

The code written for the command is taken from the [Kysely docs](https://kysely.dev/docs/migrations#running-migrations), so feel free to read them for better understanding.

```sh
node ace make:command kysely_migrate
# DONE:    create commands/kysely_migrate.ts
```

```ts
// title: commands/kysely_migrate.ts
import * as path from 'node:path'
import { db } from '#services/db'
import * as fs from 'node:fs/promises'
import { BaseCommand } from '@adonisjs/core/ace'
import { FileMigrationProvider, Migrator } from 'kysely'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class KyselyMigrate extends BaseCommand {
  static commandName = 'kysely:migrate'
  static description = 'Migrate the database by executing pending migrations'
  static options: CommandOptions = {
    startApp: true
  }

  declare migrator: Migrator

  /**
   * Prepare lifecycle hook runs before the "run" method
   * and hence, we use it to prepare the migrator
   * instance
   */
  async prepare() {
    this.migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: this.app.migrationsPath(),
      }),
    })
  }

  /**
   * The complete lifecycle hook runs after the "run" method
   * and hence, we use it to close the data connection.
   */
  async completed() {
    await db.destroy()
  }

  /**
   * Runs migrations up method
   */
  async run() {
    const { error, results } = await this.migrator.migrateToLatest()

    /**
     * Print results
     */
    results?.forEach((it) => {
      switch (it.status) {
        case 'Success':
          this.logger.success(`migration "${it.migrationName}" was executed successfully`)
          break
        case 'Error':
          this.logger.error(`failed to execute migration "${it.migrationName}"`)
        case 'NotExecuted':
          this.logger.info(`migration pending "${it.migrationName}"`)
      }
    })

    /**
     * Display error
     */
    if (error) {
      this.logger.error('Failed to migrate')
      this.error = error
      this.exitCode = 1
    }
  }
}
```

It's time to test the command and see if it works as expected.

```sh
node ace kysely:migrate
# [ success ] migration "1706859910593_create_users_table" was executed successfully
```

### The rollback command

Finally, we need another command to roll back migrations. This time, we will use the [migrateDown](https://kysely-org.github.io/kysely-apidoc/classes/Migrator.html#migrateDown) method from the `Migrator` class to rollback migrations.

```sh
node ace make:command kysely_rollback
# DONE:    create commands/kysely_rollback.ts
```

```ts
// title: commands/kysely_rollback.ts
import * as path from 'node:path'
import { db } from '#services/db'
import * as fs from 'node:fs/promises'
import { BaseCommand } from '@adonisjs/core/ace'
import { FileMigrationProvider, Migrator } from 'kysely'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class KyselyRollback extends BaseCommand {
  static commandName = 'kysely:rollback'
  static description = 'Rollback the database by running down method on the migration files'
  static options: CommandOptions = {
    startApp: true
  }

  declare migrator: Migrator

  /**
   * Prepare lifecycle hook runs before the "run" method
   * and hence, we use it to prepare the migrator
   * instance
   */
  async prepare() {
    this.migrator = new Migrator({
      db,
      provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: this.app.migrationsPath(),
      }),
    })
  }

  /**
   * The complete lifecycle hook runs after the "run" method
   * and hence, we use it to close the data connection.
   */
  async completed() {
    await db.destroy()
  }

  /**
   * Runs migrations up method
   */
  async run() {
    const { error, results } = await this.migrator.migrateDown()

    /**
     * Print results
     */
    results?.forEach((it) => {
      switch (it.status) {
        case 'Success':
          this.logger.success(`migration "${it.migrationName}" rolled back successfully`)
          break
        case 'Error':
          this.logger.error(`failed to rollback migration "${it.migrationName}"`)
        case 'NotExecuted':
          this.logger.info(`rollback pending "${it.migrationName}"`)
      }
    })

    /**
     * Display error
     */
    if (error) {
      this.logger.error('Failed to rollback')
      this.error = error
      this.exitCode = 1
    }
  }
}
```

```sh
node ace kysely:rollback
# [ success ] migration "1706859910593_create_users_table" rolled back successfully
```

## Using Kysely codegen

Let's use the `kysely-codegen` package to inspect the database and define TypeScript types. We do not need any particular setup here; follow the project README and create types inside the `types/db.ts` file.

The first step is to define the `DATABASE_URL` environment variable inside the `.env` file. The `kysely-codegen` CLI needs it to connect to the database.

```dotenv
DATABASE_URL=/Users/virk/hello-world/tmp/db.sqlite
```

```sh
npx kysely-codegen --out-file=types/db.ts

# • Loaded environment variables from .env file.
# • No dialect specified. Assuming 'sqlite'.
# • Introspecting database...
# ✓ Introspected 0 tables and generated ./types/db.ts in 5ms.
```

```ts
// title: types/db.ts
export interface Users {
  created_at: string;
  id: number;
  updated_at: string;
}

export interface DB {
  users: Users;
}
```

## Basic usage
Now that we have completed the whole lifecycle of configuring Kysely, creating migration commands, and using codegen to inspect database schema, Let's define some routes and use the Database service to write some queries.

```ts
import { db } from '#services/db'
import router from '@adonisjs/core/services/router'

router.get('/posts', async () => {
  const posts = await db
    .selectFrom('posts')
    .selectAll()
    .execute()
  
  return posts
})

router.get('/posts/:id', async ({ params, response }) => {
  const post = await db
    .selectFrom('posts')
    .selectAll()
    .where('id', '=', params.id)
    .executeTakeFirst()
  
  if (!post) {
    return response.notFound('Post not found')
  }

  return post
})
```

## Conclusion

This article showcases how we can use the existing primitives of the framework, i.e., the Ace commands, stubs system, folder structure, and naming conventions, to integrate Kysely inside an AdonisJS application seamlessly.

In the next article, I will show you how to extend this system to integrate with the Auth package.
