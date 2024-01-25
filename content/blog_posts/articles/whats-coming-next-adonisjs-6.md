---
summary: Our latest experimentation and future iterations for AdonisJS 6
---

We have just released AdonisJS 6 with a ton of new features and improvements. This release was a big milestone for us as we have been working on it for the last year. But we are not done yet and still got lots of ideas in the pipeline.

In order to finally release AdonisJS 6, we had to put on hold some ideas that we have been experimenting with. Now that AdonisJS 6 is out, our immediate focus is going to be on stabilizing it, fixing bugs and improving the documentation and migration guide. But we'll soon be able to get back to our ideas.

This year, we've spent a lot of time testing new ideas and features. Some of them are already in pretty good state, while others are still being thought and worked on. In this article, I'm going to share some of those ideas.

**Please, do not expect or ask for any release dates or timelines. We will share more details when we are ready.**

## Migrating last few packages to AdonisJS 6

First focus will be to migrate the last few packages to AdonisJS 6. We can't commit on a specific date, but expect them to be migrated in the next few weeks :

- Drive
- Limiter
- Lucid Slugify
- Attachment lite
- Route model binding
- Health checks - Removed from core to be its own package.

## @adonisjs/cache

This summer we worked on [BentoCache](bentocache.dev) - a caching library for Node.js. It is a standalone and can be used with any framework. We are planning to have a first-party integration with AdonisJS 6, and so with its own set of features.

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

BentoCache is quite different from existing caching libraries like `keyv` or `cache-manager`. Same philosophy as AdonisJS : Bentocache is fully-featured, while other libraries are more low-scope.

So we will soon have a `@adonisjs/cache` package that will be a wrapper around BentoCache and will also provide a few AdonisJS specific features. We already have a working prototype but still need to polish a few things. 

We also need to think about additional features that we could provide to this package. Russian doll caching, HTTP Response caching ... ? We are still exploring the possibilities and what could make sense for AdonisJS.

:::note
In the meantime, you can already use BentoCache with AdonisJS 6. Take a look at the [documentation](https://bentocache.dev) to learn more about it. Basically, just install the package and use it as you would with any other package.
:::

## @adonisjs/inertia 

With AdonisJS 5, we had an awesome community-package for InertiaJS, maintained by [eidellev](https://github.com/eidellev). 

Since we are ourselves using InertiaJS for our own projects, **we decided to take over the package and make it a first-party package**. 

![inertia logo](https://i.imgur.com/eTxaWws.png)

Thanks again to [eidellev](https://github.com/eidellev) for maintaining this package for so long.

We already have a prototype in a pretty good state. API is fairly similar to the V5 package, but we have added a few new features. 

There's still one thing that we need to figure out before releasing it : the server-side rendering. This one is related to our recent Vite support. Let's talk about it.

## @adonisjs/vite

This one's a big one. We'll probably be releasing a new major version of adonisjs/vite with SSR support. We gonna dig a bit deeper into this one so feel free to skip technical details if you are not interested.

### Current implemention 

To sum up quickly: With AdonisJS 5 + Webpack, and AdonisJS 6 + Vite, the strategy for compiling assets was the following: 

- You launch `node ace serve`. The main process launch the HTTP server, and start compiling your backend code with Typescript.
- At the same time, the same main process launch a new child process which is responsible for compiling the frontend assets. 
  In other words, we have an `exec('pnpm vite dev')` which launch the compilation of the assets via the asset bundler CLI tool ( Vite / Webpack ). This would be almost the same as if you were launching `pnpm vite dev` in another terminal.

This strategy works well, but it has one major drawback: it's complicated to integrate with the SSR (for reasons we won't go into here, otherwise this article will be too long).

### New implementation

With the new version of Vite, we've tried another approach: rather than launching a child process, the main process will be in charge of compiling the assets. 

Vite exposes the `createServer` function, which allows us to create a Vite dev server within an existing process. And it's possible to configure the Vite server in Middleware mode so that it's integrated with another existing HTTP server. In our case, our own: `@adonisjs/http-server`. 

For example, here's an example taken from the Vite documentation, that integrates Vite within an Express server, so you can have an idea of what it looks like:

```ts
async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure 
  // the app type as 'custom', disabling Vite's own 
  // HTML serving logic so parent server can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  app.use(vite.middlewares)

  app.listen(5173)
}

createServer()
```

Now, on some endpoints, the Vite server will be responsible for answering the request. For example, if you request `/assets/app.js`, the Vite server will answer the request with the compiled code for the same file. But if you request `/users`, Vite will just ignore the request and let the main HTTP server handle it.

It's a change that may seem insignificant, but it opens the door to something really cool: the `vite.ssrLoadModule` function. Exposed by the vite server, this function automatically transforms source code to be usable in Node.JS. For example, a `.vue` file is impossible to import natively into Node.JS. This function allows us to do just that. So yes, it opens the door to SSR super-easily.

To sum up: we're probably going to release an `@adonisjs/vite` module that will work this way, and which will enable us to do two things in particular:

- Open the possibility for the community to develop AdonisJS packages for SSR. **We could imagine a Nuxt/Next-like system, but backed by AdonisJS rather than by a simple HTTP router**.
- SSR with InertiaJS. We already have a prototype that works perfectly, and is super-simple to configure. One of the main pain points of the AdonisJS 5 inertia package was SSR. A lot of people had trouble configuring it. With our new version of adonisjs/vite, all you need to do is change a few config lines and you'll have a working SSR.

### Quick example

Just to give a quick overview of what could be possible with this new version of Vite. Here's a quick example I did. A SolidJS component that is rendered server-side, with a NextJS-like `getServerSideProps` function for fetching data.

- When rendered server-side, on initial page load, the whole code will be executed server-side : first the `getServerSideProps` function, then the component itself (which will be hydrated client-side).
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

As you can see, we have something that is very similar to frontend meta-frameworks like NextJS or NuxtJS, **but backed with the power of AdonisJS**. We are able to use any AdonisJS feature, like Lucid, Mail, Events, etc in our backend code. 

Some may say that this is not a good idea, that we are loosing the spirit of AdonisJS, or that we are trying to do too much. You are free to not use it if you don't like this approach. But we think that this is great to open the door to that possibility, if some people want to use AdonisJS this way.

Also note, this is very barebone example, but we can imagine building something way more advanced on top of it. At least, the API provided by `@adonisjs/vite` will allow us and the community to build something like this. [Radonis](https://radonis.vercel.app/) was an excellent example of that.

:::note
If you speak French, Romain and I did a live stream of 2 hours ( 🥵 ) about this exact topic. You can [watch it here](https://www.youtube.com/watch?v=V1K2Gp3L95Y). We showed an example of SSR with InertiaJS + AdonisJS + Vite, and also a basic [Vike](https://vike.dev/) integration in AdonisJS.
:::

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

Transmit should be released in the next few weeks. Get ready for it!

## @adonisjs/locks

A few weeks ago, we released [Verrou](verrou.dev), an agnostic package for NodeJS that can be used with any framework. The purpose of the package is to provide a simple API for locking (mutexes), also known as "Atomic locks". Verrou supports several drivers: Redis, Postgre, Mysql, Sqlite, In-memory ...

```ts
const lock = verrou.createLock('payment:1')

await lock.run(async () => {
  await criticalSection()
})
```

So we'll probably have an `@adonisjs/locks` package to wrap Verrou and enable first-party integration with Adonis. For the time being, we don't yet have any Adonis-specific features in mind, but the package will at least enable us to have an API similar to the other AdonisJS packages, reuse the redis/mysql/postgre connections defined in the `@adonisjs/redis` and `@adonisjs/lucid` config and so on.

:::note
In the meantime, you can already use Verrou with AdonisJS 6. Take a look at the [documentation](https://verrou.dev) to learn more about it. Same as BentoCache, just install the package and use it as you would with any other package.
:::

## node ace add

With V5 we saw a lot of users missing the `node ace configure` command. We thought it was due to bad UX, but it turns out that we have the same problem with V6. So we are exploring the idea of having a `node ace add` command. It will be similar to `npm install package` then `node ace configure package` but in a single command.

Small addition, but still cool : https://github.com/adonisjs/core/pull/4296

## Eslint Flat Configuration

ESLint shipped a new configuration format in their latest version, called [Flat Configuration](https://eslint.org/docs/latest/use/configure/configuration-files-new). This syntax is way more easier to maintain and extend. We gonna ship a new version of `@adonisjs/eslint-config` with this new syntax. We need to move forward since this is the future of Eslint.

## More content

One of the main drawback of AdonisJS is not even technical : it's the lack of popularity. The first step that we are taking to solve this problem is to create more content. Expect more blog posts like this one, courses, and live streams in the future.

## Conclusion

There a few other exciting ideas that we are exploring, but they are still in the early stages. So I will not talk about them in this article. Can't wait to share more details about them in the future. 

First, let's ship the things we talked about in this article.

Of course, we will also continue improving and polishing the existing packages.

Hope you guys are as excited as we are about the ideas we are working on. If you have any questions or suggestions, feel free to reach out to us on [Twitter](https://twitter.com/adonisframework) or [Discord](https://discord.gg/vDcEjq6).
