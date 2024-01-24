---
summary: Our latest experimentation and future iterations for AdonisJS 6
---

We just released AdonisJS 6 with a ton of new features and improvements. This release was a big milestone for us as we have been working on it for the last year. But we are not done yet and still have a lot of things to share with you. 

We spent a lot of time experimenting with new ideas and features this year. Some of them are already in experimental mode, while others are still being worked on. In this article, I will share some of the ideas we worked on. Please, do not expect any release dates or timelines. We will share more details about them when they are ready.

## Migrating last few packages to AdonisJS 6

There are a few packages that we still need to migrate to AdonisJS 6. Can't commit on a specific date but expect them to be migrated in the next few weeks :

- Drive
- Limiter
- Attachment lite
- Lucid Slugify
- Route model binding
- Health checks - Removed from core to be its own package.

## @adonisjs/cache

This summer I worked on [BentoCache](bentocache.dev) - a caching library for Node.js. It is a standalone library and can be used with any framework. We are planning to have a first-party integration with AdonisJS 6, and so with its own set of features. 

Take a look at the [BentoCache documentation](https://bentocache.dev) to learn more about it, but to give you a quick overview, main features are:

- Support for multiple drivers
- Cache Stampede protection
- Multi-tier caching support ( Redis + In-memory for example )
- Tons of cache features like namespaces, early refresh, timeouts ...
- Prometheus integration

```ts
import User from '#app/models/user'
import cache from '@adonisjs/cache/services/main'

const result = await cache.getOrSet('users:1', () => User.find(1))
```

We will soon have a `@adonisjs/cache` package that will be a wrapper around BentoCache and will provide a few AdonisJS specific features. We already have a working prototype but still need to polish a few things. 

We also need to think about specific features that we could provide to this package. Russian doll caching, HTTP Response caching ... ? We are still exploring the possibilities and what make sense for AdonisJS.

## @adonisjs/inertia 

With AdonisJS 5, we had an awesome community-package for InertiaJS, maintained by [eidellev](https://github.com/eidellev). Since we are ourselves using InertiaJS for our own projects, **we decided to take over the package and make it a first-party package**. Thanks again to [eidellev](https://github.com/eidellev) for maintaining this package for so long. 

We already have a prototype in a pretty good state. API is fairly similar to the V5 package, but we have added a few new features. There's still one thing that we need to figure out before releasing it : the server-side rendering. This one is related to our recent Vite support. Let's talk about it.

## @adonisjs/vite

This one's a big one. We'll probably be releasing a new major version of adonisjs/vite with SSR support. To sum up quickly: With AdonisJS 5 + Webpack, and AdonisJS 6 + Vite, the strategy for compiling assets was as follows: 

- When you launch `node ace serve` then the main process compile your backend code with Typescript.
- At the same time, the main process launch a child process which is responsible for compiling the frontend assets.
  - In other words, we have an `exec('pnpm vite dev')` which launch the compilation of the assets via the asset bundler CLI tool ( Vite / Webpack ).

This strategy works well, but it has one major drawback: it's complicated to integrate with the SSR (for reasons we won't go into here, which could be the subject of another article).

With the new version of Vite, we've tried another approach: rather than launching a child process, the main process will be in charge of compiling the assets. Vite exposes the `createServer` function, which allows you to create a Vite dev server within an existing process. And it's possible to configure the Vite server in Middleware mode so that it's integrated with another existing HTTP server. In our case, our own: `@adonisjs/http-server`. See an example with Vite + Express in the Vite documentation: https://vitejs.dev/guide/ssr#setting-up-the-dev-server

It's a change that may seem insignificant, but it opens the door to something really cool: the `vite.ssrLoadModule` function. Exposed by the vite server, this function automatically transforms source code to be usable in Node.JS. For example, a `.vue` file is impossible to import natively into Node.JS. This function allows us to do just that. So yes, it opens the door to SSR super-easily.

To sum up: we're probably going to release an `@adonisjs/vite` module that will work this way, and which will enable us to do two things in particular:

- Open the possibility for the community to develop AdonisJS packages for SSR. We could imagine a Nuxt/Next-like system, but backed by AdonisJS rather than by a simple HTTP router.
- SSR with InertiaJS. We already have a prototype that works perfectly, and is super-simple to configure. One of the main pain points of the AdonisJS 5 inertia package was SSR. A lot of people had trouble configuring it. With our new version of adonisjs/vite, all you need to do is change a few config lines and you'll have a working SSR.

:::note
If you speak French, Romain and I did a live stream of 2 hours ( 🥵 ) about this exact topic. You can [watch it here](https://www.youtube.com/watch?v=V1K2Gp3L95Y).
:::

## @adonisjs/locks

A few weeks ago, I released [Verrou](verrou.dev), an agnostic package for NodeJS that can be used with any framework. The purpose of the package is to provide a simple API for locking (mutexes), also known as "Atomic locks". Verrou supports several drivers: Redis, Postgre, Mysql, Sqlite, In-memory ...

```ts
const lock = verrou.createLock('payment:1')

await lock.run(async () => {
  await criticalSection()
})
```

So we'll probably have an `@adonisjs/locks` package to wrap Verrou and enable first-party integration with Adonis. For the time being, we don't yet have any Adonis-specific features in mind, but the package will at least enable us to have an API similar to the other AdonisJS packages, reuse the redis/mysql/postgre connections defined in the `@adonisjs/redis` and `@adonisjs/lucid` config and so on.

## Transmit 

Transmit will be our official package to implement natively SSE (Server-Sent Events) in AdonisJS, allowing you to build real-time applications. Additionally, you will be able to broadcast events across multiple servers or instances using the inbuilt Redis transport layer. 

The API will be super simple to use. Here's a quick example:

```ts
import transmit from '@adonisjs/transmit/services/main'

transmit.broadcast('chat', { message: 'hello' })
```

```ts
import { Transmit } from '@adonisjs/transmit-client'

const transmit = new Transmit({ baseUrl: 'localhost:3333' })
transmit.listen('chat', (message) => console.log(message))
```

## More content

One of the main drawback of AdonisJS is the lack of popularity. The first step that we are taking to solve this problem is to create more content. Expect more blog posts like this one, courses, and live streams in the future.

## Others

- We are exploring adding a `node ace add` command. It will be similar to `npm install package` then `node ace configure package` but in a single command.
- We gonna ship a new version of `@adonisjs/eslint-config` with [Eslint Flat Configuration](https://eslint.org/docs/latest/use/configure/configuration-files-new). This syntax is way more easier to maintain and to extend. We need to move forward since this is the future of Eslint. 

## Conclusion

There a few other ideas that we are exploring, but they are still in the early stages. So I will not talk about them in this article. Can't wait to share more details about them in the future.

Hope you guys are as excited as we are about the ideas we are working on. If you have any questions or suggestions, feel free to reach out to us on [Twitter](https://twitter.com/adonisframework) or [Discord](https://discord.gg/vDcEjq6).
