---
summary: AdonisJS 7 brings a new Lucid ORM, type-safe routing, improved Inertia support, diagnostic channels, encryption updates, and a flexible notification system.
---

It has been a while since we published our last article. We've been cooking "undercover" for quite some time, and we're excited to finally share with you the roadmap to AdonisJS 7.

First and foremost, you've probably heard me say it before: we don't ship major releases without a solid reason. AdonisJS 5 introduced TypeScript at the core of the framework, while AdonisJS 6 embraced ESM and brought the framework up to speed with modern JavaScript standards.

This time, we're shifting gears. Instead of waiting for external changes in the ecosystem, **we've decided to publish major releases more frequently**. But don't worry, the stability of your application remains a top priority. In fact, upgrades will be significantly smoother from now on. **A major version bump will no longer mean a full rewrite. You'll be able to upgrade in just a few minutes.**

This article offers a broad look at what's coming in AdonisJS 7. Some topics will get their own deep-dive articles closer to release.

**Keep in mind: naming and syntax may still evolve as we finalize the implementation.**

## Bump minimum Node.js version to new LTS (BREAKING)

This will be a breaking change for some applications: AdonisJS 7 will require Node.js 24 as the new minimum version.

By aligning with the current LTS release, we will be able to take advantage of modern APIs that power some of the upcoming features, while continuing to deliver first-class performance and developer experience.

## Diagnostic Channel

We want to give you full control to diagnose, trace, and debug your application. To make that possible, AdonisJS 7 will embrace the [Node.js diagnostic channel](https://nodejs.org/api/diagnostics_channel.html), a built-in module that lets libraries create named channels for reporting diagnostic messages.

Each AdonisJS module will define multiple channels that you will be able to tap into to trace your application's behavior in real time, **without sacrificing performance**.

This will enable to write adapters for popular tools like _OpenTelemetry_, _DataDog_, and others, so you will be able to integrate AdonisJS tracing seamlessly into your existing observability stack.

## New Lucid Major

While not strictly tied to AdonisJS 7, the next major version of Lucid will be fully compatible with it, and you will be able to use it in your existing AdonisJS 6 applications as well.

We'll dedicate a separate article to all the changes, but here's a quick preview of some of the new features you can expect:

### Standalone

With this new update, Lucid will become a truly standalone module that you will be able to use in any Node.js application, not just within AdonisJS.

The current version is still tightly coupled to AdonisJS, mainly due to its dependency on Ace. This limitation will be removed, making Lucid a more flexible ORM you will be able to integrate wherever you need it.

### Columns computed from database

You will be able to generate your model columns directly from the database using a dedicated command. This means your models will stay focused on business logic, no more repeating boilerplate code just to declare fields.

In the example below, the `Poll` model extends the auto-generated `PollSchema` class. The `PollSchema` contains all the columns fetched from the database, so you will no longer need to define them manually.

Whenever you run migrations using the `migration:run` command, the schema classes will be updated automatically.

As a result, your models will only define relationships, computed properties, and decorators, often in just a few lines of code.

```ts
export default class Poll extends PollSchema {
  @slugify({
    fields: ['title'],
    strategy: 'dbIncrement',
  })
  declare slug: string;

  @hasMany(() => PollOption)
  declare options: HasMany<typeof PollOption>;

  @belongsTo(() => User)
  declare author: BelongsTo<typeof User>;

  get expired() {
    return this.closesAt.diff(DateTime.local(), 'seconds').seconds <= 0;
  }
}
```

Here's an example of the auto-generated `PollSchema` class:

```ts
export class PollSchema extends BaseModel {
  static $attributes = ['id', 'userId', 'title', 'pollColor', 'slug', 'closesAt', 'createdAt', 'updatedAt'] as const;
  @column({ isPrimary: true })  
  declare id: number;  
  @column()
  declare userId: number;  
  @column()
  declare title: string;  
  @column()
  declare pollColor: string;  
  @column()
  declare slug: string;  
  @column.dateTime()
  declare closesAt: DateTime;
  @column.dateTime({ autoCreate: true })  
  declare createdAt: DateTime | null;
  @column.dateTime({ autoCreate: true, autoUpdate: true })  
  declare updatedAt: DateTime | null;
}
```

You will also be able to customize the generation process using a `rules.json` file. For example, you will be able to:
- Define branded types for JSON or enum columns.
- Use specific decorators or imports for certain fields.
- Apply project-wide conventions, like UUIDs for primary keys.

Multiple `rules.json` files will be supported. For example, one per package if you're using shared value objects or domain types.

```json
{
  "columns": {  
    "id": {
      "tsType": "UUID",
      "imports": ["import { UUID } from '#models/values/uuid'"],
      "decorator": "@column()"  
    }
  },
  "tables": {
    "users": {
      "role": {
        "tsType": "UserRoles",
        "imports": ["import { UserRoles } from '#models/values/uuid'"],
        "decorator": "@column()"
      }
    }
  }
}
```

### Value Object handled by default

Sometimes, it's better to wrap a value inside a proper class instead of treating it as a simple primitive. This is where value objects come in handy. For example, you might want to use an `Email` class to encapsulate email-related behavior and validation.

With the new version of Lucid, you will be able to define your column types as value objects. Lucid will handle the serialization when saving to the database, and automatically return an instance of your value object when fetching the model.

Let's say you have a `Point` class representing a geographical location using latitude and longitude. By adding a `toDatabase` and a `fromDatabase` method to it, you will be able to save it directly into the database:

```ts
class Point {
  constructor(
    public latitude,
    public longitude
  ) {}

  isDirty(oldValue: Point) {
    return oldValue.latitude !== this.latitude || oldValue.longitude !== this.longitude
  }

  static fromDatabase(latitude: number, longitude: number) {
    return new Point(latitude, longitude)
  }

  toDatabase() {
    return db.raw(`POINT(${this.latitude} ${this.longitude})`)
  }

  toJSON() {
    return {
      latitude: this.latitude,
      longitude: this.longitude,
    }
  }
}
```

You will then be able to use the Point class as a regular column type in your model:

```ts
class User {
  @column()
  declare location: Point
}

const user = new User()
user.location = new Point(38.8951, -77.0364)

await user.save()
```

This feature will make your models more expressive and easier to reason about, especially when working with complex data types.

## HTTP Transformer

In AdonisJS 7, you will be able to define **HTTP transformers** to handle how your data is serialized before being sent to the client, instead of returning raw model instances, which can be problematic for type inference and structure control.

Transformers offer a clean, functional API for shaping your responses. You will be able to cherry-pick properties, transform values, and include additional data, all in a type-safe and declarative way.

In the following example, a transformer is defined for the `Poll` model. The `toObject` method returns the serialized representation of the model, ready to be sent in an HTTP response.

```ts
import { BaseTransformer } from '@adonisjs/core/transformers';  
import PollOptionTransformer from '#transformers/poll_option';  
import UserTransformer from '#transformers/user';  
import type Poll from '#models/poll';

export default class PollTransformer extends BaseTransformer<Poll> {
  toObject() {
    return {
      /**
       * Pick properties from an object (a model instance in this case)
       */
      ...this.pick(this.resource, [
        'id',
        'title',
        'pollColor',
        'slug',
        'expired',
      ]),
      /**
       * Additional properties to serialize
       */
      closesAt: this.resource.closesAt.toRelative({ style: 'short' }),
      votesCount: this.countOf('votes'),
      /**
       * Use other transformers
       */
      author: UserTransformer.item(this.whenLoaded(this.resource.author)),
      options: PollOptionTransformer.collection(this.whenLoaded(this.resource.options)),
    };
  }
}
```

### Infering Type

If you're building an Inertia app or an API used in the same codebase as your frontend, you will be able to generate types directly from your transformers. This will allow your frontend to consume backend data with full type safety.

Generated types are stored in `.adonisjs/frontend/data.d.ts`:

```ts
import { InferData } from '@adonisjs/core/transformers';

export type PollOptionData = InferData<import('../../app/transformers/poll_option.ts').default>;
export type PollData = InferData<import('../../app/transformers/poll.ts').default>;
export type UserData = InferData<import('../../app/transformers/user.ts').default>;
```

### Notes on Transformers
- Transformers can be used with **any data type**, not just Lucid models. 
- The `toObject` method **must return JSON-serializable values** (no classes, maps, sets, or symbols).
- `toObject` can be **async**, allowing you to embed things like permissions via bouncer policies.
- Since transformers are resolved through the **IoC container**, you will be able to inject services using the `@inject` decorator.

## Type-Safe URL Generator

AdonisJS 7 will introduce a **type-safe URL builder** for generating route URLs, both on the backend and the frontend.

You will be able to generate a client for your frontend application automatically. This client will live inside the `.adonisjs/frontend/url_builder.ts` file and offer the same functional API as on the server side, giving you full auto-completion and type safety across your entire stack.

Here's what the developer experience will look like:

```ts
import { urlFor } from '@adonisjs/core/http/url_builder';

// Will suggest all the routes
urlFor('users.show', [1]); // /users/1

// Will suggest only GET routes
urlFor.get('users.show', [1]); // { method: 'get', url: 'users/1' }

// Will suggest only POST routes
urlFor.post('users.show', [1]); // Error (no users.show) route exists for POST method

// Creating a signed URL
urlFor.post('email.verify').signed(); // { method: 'post', url: '...' }
```

This tight integration between routes and types will help catch mistakes early and reduce hardcoded strings in your application.

When using the `response.redirect()` method, you will only be able to target `GET` routes, ensuring that redirects are valid and safe by design:

```ts
response.redirect().toRoute('<--ONLY GET ROUTES-->');
```

### Frontend usage

The generated URL builder client will be usable in any frontend application, whether you are building with Inertia, a standalone Nuxt app, or even a lightweight Alpine JS interface.

You will be able to import and use it just like on the backend, with full type safety and auto-completion. However, keep in mind that **you will not be able to generate signed URLs from the frontend.** This must always happen server-side.

```tsx
import { urlFor } from '~generated/url_builder';
  
<Link href={urlFor.get('posts.show', [1])}> View post </Link>
```

Submitting a form with Inertia:

```tsx
import { useForm } from '@inertiajs/react';
import { urlFor } from '~generated/url_builder';
  
const form = useForm({});
form.post(urlFor.post('signup.action'));
```

This consistent API across the backend and frontend will help reduce errors and keep route definitions in sync throughout your stack.

## Encryption

AdonisJS 7 will include a brand-new encryption layer, completely rewritten under the [BoringNode](https://github.com/boringnode) organization. This new implementation is fully standalone and framework-agnostic, making it easier to reuse across other Node.js projects.

The new encryption system brings several improvements:

- **Key rotation support**
  You will be able to rotate your encryption keys without breaking existing data, making your app more secure and compliant with long-term best practices.
- **Support for multiple encryption algorithms**
  You will be able to choose between modern and secure algorithms like `aes_256_cbc`, `aes_256_gcm`, and `chacha20_poly1305`.
    
  A legacy driver will also be provided to help you migrate existing encrypted data without breaking compatibility.
- **Multiple encrypters**
  Just like `storages` or `mailers`, you will be able to define multiple named encrypters using the driver pattern already familiar in AdonisJS.
    
  This is useful when you want to encrypt data differently depending on the context (e.g., user tokens vs. internal secrets).
    
This rewrite keeps the same developer-friendly API while making encryption safer, more flexible, and ready for modern security needs.

## Better Inertia Type-Safety

Today Inertia page components in AdonisJS rely on the controller to define their props. This is done using `InferPageProps`, which infers the expected props based on the `inertia.render` call from a specific controller method:

```ts
import { InferPageProps } from '@adonisjs/inertia/types';
import type { UsersController } from '../../controllers/users_controller.ts';
  
export function UsersPage(
  props: InferPageProps<UsersController, 'index'>
) {
  // Fully typed props based on controller
}
```

While this works well in simple cases, it introduces a limitation: **views become tightly coupled to controllers**. If a view is reused in multiple places, you're forced to make compromises on what props it expects, or duplicate code. Also, if a controller method has multiple return paths (e.g., redirects, error responses), the type inference can break or give false confidence, leading to runtime issues.

We believe the flow should be reversed: the **view should declare the props it needs**, and **controllers should be responsible for providing those props**.

In AdonisJS 7, we're working on shifting that responsibility to the page component. You will be able to define the expected props in the view itself, and the controller will be type-checked to ensure it provides the correct data.

This change will make your frontends more predictable, reduce coupling between controllers and views, and give you a clearer boundary between data and presentation.

## Facteur — A new notification system

AdonisJS 7 will introduce first-class support for notification, a flexible and type-safe notification system inspired by Laravel's notifications, but designed with modern patterns and extensibility in mind.

With Facteur, you will be able to define messages once and deliver them through multiple channels like **mail**, **Slack**, **Discord**, **Telegram**, or even **custom database records**.

```ts
class BackupStartedMessage extends Notification<User, BackupStartedMessageParams> {  
  static readonly name = 'backupStarted';

  via(notifiable) {
    return notifiable.preferDiscord ? ['discord'] : ['slack', 'mail'];
  }

  toDatabase({ params }) {
    return DatabaseMessage.create()
      .setType('backup-started')
      .setContent(`Backup started: ${params.backupName} to ${params.destination}`);
  }

  toDiscord({ notifiable, params }) {
    const body = `Backup started: ${params.backupName} to ${params.destination}.\n` + `@${notifiable.discordUsername}`;
    
    return DiscordMessage.create().setBotUsername('Backup manager').setBody(body);
  }
}
```

## Tuyau + TanStack Query

In AdonisJS 7, the new version of [**Tuyau**](https://tuyau.julr.dev/docs/introduction), our type-safe HTTP client generator, will include **first-class support for** [**TanStack Query**](https://tanstack.com/query).

You will be able to generate `queryOptions` directly from your API definition, giving you full auto-completion and type safety when using TanStack Query in your frontend.

```ts
const tuyauClient = createTuyau<ApiDefinition>({
	baseUrl: 'http://localhost:3333'
});

const tuyau = createTuyauReactQueryClient({ client: tuyauClient });

const { data } = useQuery(
  tuyau.users.$get.queryOptions({ name: 'foo' })
);

console.log(data?.[0].name);
```

## Conclusion

That wraps up our overview of what's coming in AdonisJS 7. This new release sets the stage for a more robust, faster, and developer-focused framework.

We are proud to keep pushing the Node.js ecosystem forward, helping developers build better, more reliable, and faster applications all around the world.

We would love to hear what you think. Join the conversation on [Discord](https://discord.gg/vDcEjq6) or share your thoughts in the GitHub Discussion linked to this article.
