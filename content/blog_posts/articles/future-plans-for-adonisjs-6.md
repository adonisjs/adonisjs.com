---
summary: Our latest experimentation and future iterations for AdonisJS 6
---

We have just released AdonisJS v6 with many new features and improvements. This release was a big milestone, as we have been working on it for the last year. We have shipped a lot of new improvements and features in this release, but we have a lot more in the pipeline.

During the v6 release, we had to put some ideas we had been experimenting with on hold. Also, our immediate focus will be stabilizing the framework, fixing bugs, and improving the migration guide. 

However, we will soon be able to get back to those ideas, but first, let's take a sneak peek at what's cooking behind the scenes.

**Please do not expect or ask for any release dates or timelines. We will share more details when we are ready.**

## Migrating the last few packages to AdonisJS v6

The first focus will be to migrate the last few packages to AdonisJS 6. We can't commit on a specific date, but expect them to be migrated in the next few weeks :

- Drive
- ~~Limiter~~ : Already released. See the [changelog](https://github.com/adonisjs/limiter/releases/tag/v2.1.0) and the [documentation](https://docs.adonisjs.com/guides/rate-limiter#rate-limiter)
- Lucid Slugify
- Attachment lite
- Route model binding
- Health checks - Removed from core to be its own package.

## @adonisjs/cache

Last summer (2023), we worked on [BentoCache](https://bentocache.dev) - a caching library for Node.js. It is a standalone package and can be used with any framework. We plan to have a first-party integration of BentoCache with AdonisJS with its own set of features.

Take a look at the [BentoCache documentation](https://bentocache.dev) to learn more about it, but to give you a quick overview, the main features are:

- Support for multiple drivers.
- Cache Stampede protection.
- Multi-tier caching support (Redis + In-memory for example).
- Tons of cache features like namespaces, early refresh, timeouts, etc.
- Prometheus integration.

You can access the BentoCache APIs using the `@adonisjs/cache` singleton service. Here's a quick example of the same.

```ts
import User from '#app/models/user'
import cache from '@adonisjs/cache/services/main'

const result = await cache.getOrSet('users:1', () => User.find(1))
```

BentoCache differs from existing caching libraries like `keyv` or `cache-manager`. Same philosophy as AdonisJS - Bentocache is fully featured, while other libraries are more low-scope.

So, we will soon have a `@adonisjs/cache` package that will be a wrapper around BentoCache and provide a few AdonisJS-specific features. We already have a working prototype but still need to polish a few things.

We also need to consider additional features we could provide this package. Could it be Russian doll caching, HTTP Response caching, etc? We are still exploring the possibilities and what could make sense for AdonisJS.

:::note
In the meantime, you can already use BentoCache with AdonisJS 6. Please look at the [documentation](https://bentocache.dev) to learn more about it. Just install the package and use it as you would with any other package.
:::

## @adonisjs/inertia 

With AdonisJS v5, we had a fantastic community package for InertiaJS, maintained by [eidellev](https://github.com/eidellev). Thanks again to eidellev for maintaining this package for so long.

Since we are using InertiaJS for our projects, **we decided to take over the package and maintain it officially**.

![inertia logo](/inertia_banner.png)

The package is already usable and functional, and the API is almost identical to the `eidellev/inertiajs-adonisjs` package, with a few extra features. **We, therefore, plan to release it in the coming weeks.**

**However, the first version will not support SSR**. Since we've had many requests for it, we decided to release the first version quickly, allowing you to start working with it. When the SSR version is ready, you'll only have to change a few config lines to enable it. No significant changes to expect.

Why is SSR not supported in the first version? This is related to how we use Vite inside an AdonisJS application. Let's talk about it.

## @adonisjs/vite

Soon, we will release a new major version of the `@adonisjs/vite` package with SSR support. There will be some breaking changes, as we will change how we integrate with Vite within an AdonisJS application.

In the following subsections, we will take a deep dive into how Vite works inside an AdonisJS application; feel free to skip these sections if you are interested in the inner technical details.

### Current implementation 

Currently, AdonisJS and Vite run in two separate processes. Following is a simplified explanation of the same.

- You run the `node ace serve` command. The `serve` command starts the HTTP server (via `bin/server.ts`) file.
- At the same time, the `serve` command launches a new child process responsible for compiling the frontend assets. Under the hood, the command runs `exec('npx vite dev')` and lets Vite handle the compilation of frontend assets.

This strategy works well, but since AdonisJS and Vite are running in separate processes, they cannot access each other's APIs. However, to make SSR work seamlessly, AdonisJS should be able to access Vite's APIs and compile frontend code (let's say `.vue` files) using Vite.

### New implementation

With the new version of Vite, we are trying another approach. Rather than launching a child process, the main process will be in charge of compiling the assets.

Vite exposes a function called `createServer`, which allows us to create a Vite dev server within an existing process. And it's possible to configure the Vite server in Middleware mode to integrate it with another existing HTTP server. In our case, it will be integrated with the `@adonisjs/http-server` package.

Here's an example taken from the Vite documentation that integrates Vite within an Express server so you can understand what it looks like.

```ts
async function createServer() {
  const app = express()

  // Create a Vite server in middleware mode and configure 
  // the app type as 'custom', disabling Vite's own 
  // HTML serving logic so the parent server can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.middlewares)

  app.listen(5173)
}

createServer()
```

Now, on some endpoints, the Vite server will answer the request. For example, if you request `/assets/app.js` on this Express Server, Vite will answer the request with the compiled code for the same file. But if you request `/users`, Vite will ignore the request and let the Express server handle it.

It's a change that may seem insignificant, but it opens the door to something really cool: the `vite.ssrLoadModule` function. Exposed by the Vite server, this function automatically transforms a frontend-focused source code into a function that you can execute in Node.js runtime. 

For example, if you provide a `.vue` file to the `vite.ssrLoadModule` method, the output will be a function we can run within the Node.js runtime. So yes, it opens the door to perform new-age SSR with Vite inside an AdonisJS application.

This approach will open up the room a lot of new possibilities.

- Very first, we will be able to achieve SSR with Inertia. We already have a prototype that works perfectly and is super simple to configure.
- On the wilder side, it allows the community to develop a meta-framework like Next or Nuxt but powered by AdonisJS rather than a simple HTTP router. [See below for a quick example](#quick-example).

:::note
Heads up! We are not planning to create a meta-framework. We are using Vite in a way that will allow others to use their imagination to create something they might need.
:::

### Quick example

To give a quick overview of what could be possible to build with the API exposed by the new version of Vite. Here's a quick example I did. A SolidJS component rendered server-side, with a NextJS-like `getServerSideProps` function for fetching data.

- When rendered server-side, on initial page load, the whole code will be executed server-side: first the `getServerSideProps` function, then the component itself (which will be hydrated client-side).
- When rendered client-side ( for example, when navigating from another page to this one ), an HTTP request will be made to fetch the data, the `getServerSideProps` function will be executed server-side and return the data as JSON, and the component will just receive the data as props.

```tsx
/// resources/pages/post.tsx
import type { getServerSideProps } from './page.server.js'

export default function Page(
  props: InferPageProps<typeof getServerSideProps>
) {
  return (
    <div>
      <h1>{props.title}</h1>
      <p>{props.description}</p>
    </div>
  )
}
```


```ts
/// resources/pages/post.server.ts
import Post from '#app/models/post'

export default function getServerSideProps() {
  // Get the post from the database using Lucid
  const post = await Post.find(1)

  // Return the props
  return { pageProps: post.toJSON() }
}
```

As you can see, we have something very similar to Next/Nuxt DX, but with the difference that our backend is powered by AdonisJS. As a result, we can use all the AdonisJS features in our backend code.

Note also that this is a barebone example. It doesn't even look like the AdonisJS paradigm we are used to. But we could imagine someone building something much more advanced on top of it, which looks more like what we are used to with AdonisJS. [Radonis](https://radonis.vercel.app/) is an excellent example of this.

To conclude, I will insist on this again: **This is an example of something possible to build with the API exposed by our new version of Vite**. We're not changing our focus; AdonisJS will remain a backend-first framework, and we'll keep the same philosophy. The main goal of the new version of Vite is to enable SSR with InertiaJS. And by doing that, we are opening the door to these new possibilities we have just mentioned.

:::note
If you speak French, Romain and I did a live stream of 2 hours ( 🥵 ) about this exact topic. You can [watch it here](https://www.youtube.com/watch?v=V1K2Gp3L95Y). We showed an example of SSR with InertiaJS + AdonisJS + Vite and a basic [Vike](https://vike.dev/) integration in AdonisJS.
:::

## Transmit

Transmit will be an official package that allows you to use SSE (Server-Sent Events) to make real-time applications using AdonisJS. Using the inbuilt Redis transport layer, you will also broadcast events across multiple servers or instances.

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

## @adonisjs/locks

A few weeks ago, we released [Verrou](https://verrou.dev), a framework agnostic package for NodeJS that can be used with any framework. The purpose of the package is to provide a simple API for locking (mutexes), also known as "Atomic locks". Verrou supports several drivers: Redis, PostgreSQL, MYSQL, SQLite, and an in-memory for testing.

```ts
const lock = verrou.createLock('payment:1')

await lock.run(async () => {
  await criticalSection()
})
```

So, we will probably have an `@adonisjs/locks` package to wrap Verrou's API and enable first-party integration with the rest of the framework. The features set for the `@adonisjs/locks` package will remain the same. But, we can re-use existing connections from the `@adonisjs/redis` and `@adonisjs/lucid` packages.

:::note
In the meantime, you can already use Verrou with AdonisJS 6. Please look at the [documentation](https://verrou.dev) to learn more about it. Like BentoCache, install the package and use it as you would with any other package.
:::

## node ace add

With V5, we saw a lot of users missing the `node ace configure` command. We thought it was due to bad UX on the docs website, but it turns out that we have the same problem with V6. So, we are exploring the idea of having a `node ace add` command. It will be similar to the `npm install package` and `node ace configure package` but in a single command.

A small addition, but still cool: https://github.com/adonisjs/core/pull/4296

## ESLint Flat Configuration

ESLint shipped a new configuration format in their latest version, called [Flat Configuration](https://eslint.org/docs/latest/use/configure/configuration-files-new). This syntax is way easier to maintain and extend. With this new syntax, we will ship a new version of the `@adonisjs/eslint-config` package. This change will not impact your applications in any way.

## More content

AdonisJS has always been loved by its users for its elegant syntax, simple APIs, and technical choices. However, we do in terms of discoverability and popularity, which results in a need for more learning content. 

First, let's recognize the efforts of [Tom from Adocasts](https://adocasts.com/) for creating screencasts on a website dedicated to AdonisJS. However, we must also pull up our socks and make time and space to develop official courses, write blog posts, and do live streams.

## Conclusion

We are exploring a few other exciting ideas, but they are still in the early stages. So I will not talk about them in this article. Can't wait to share more details about them in the future. 

First, let's ship the things we talked about in this article. Of course, we will also continue improving and polishing the existing packages.

Hope you guys are as excited as we are about the ideas we are working on. If you have any questions or suggestions, feel free to reach out to us on [Twitter](https://twitter.com/adonisframework) or [Discord](https://discord.gg/vDcEjq6).
