---
summary: Announcing Tuyau, a new library in the AdonisJS ecosystem for having an E2E typesafe client-server communication.
---

![](https://static.julr.dev/tuyau.png)

We are thrilled to announce the first release of [Tuyau](https://github.com/Julien-Sponsors/tuyau), a new library in the AdonisJS ecosystem, offering a typesafe, end-to-end client for interacting with your AdonisJS APIs.

You can find the repository [here](https://github.com/Julien-R44/tuyau) and the documentation [here](https://tuyau.julr.dev/).

## Typesafe E2E Client? What’s that?

Imagine you have an AdonisJS API ready to go, and you want to consume it in your frontend, whether it’s built in React, Vue, or another framework. Typically, you would create a class or file that contains methods to call various API routes, like this:

```ts
export class MyAPI {
  async getPosts(options) {
    return fetch(
      `/posts?page=${options.page}&limit=${options.limit}`
    )
  }

  async getPost(id: number) {
    return fetch(`/posts/${id}`)
  }
}
```

This works, but there are a few issues with this code:

- No type safety: You don’t know what you’re sending or receiving.
- A lot of boilerplate code to write for each API route. Here, we have just two routes, but if you have 10, 20, or 50, it becomes quickly tedious and repetitive.

To fix the first issue, you can manually add your types like this:

```ts
interface Post {
  id: number
  title: string
}

interface GetPostsOptions {
  page?: number
  limit?: number
}

export class MyAPI {
  async getPosts(options: GetPostsOptions): Promise<Post[]> {
    return fetch(
      `/posts?page=${options.page}&limit=${options.limit}`
    )
  }

  async getPost(id: number): Promise<Post> {
    return fetch(`/posts/${id}`)
  }
}
```

While this is better, we still face the issue of keeping types in sync. If a field name changes in your API, you’ll need to update it in the client too, which risks desynchronization between the backend and frontend. Also, manually creating and maintaining these types is time-consuming, error-prone and not very fun.

This is where Tuyau comes in. Tuyau offers an alternative way: an automatically generated frontend client from your AdonisJS API that is 100% typesafe without the need to maintain any types or runtime code yourself. Tuyau uses code generation to detect input and output types for your routes. Let’s take the same API example, now using Tuyau:

```ts
// In your frontend
import { createTuyau } from '@tuyau/client'
import { api } from '@your-monorepo/my-adonisjs-app/.adonisjs/api'

export const tuyau = createTuyau({
  api,
  baseUrl: 'http://localhost:3333',
})

const posts = tuyau.posts.$get({ page: 1, limit: 10 })
const post = tuyau.posts({ id: 1 }).$get()
```

**Everything in this example is fully typesafe**: routes parameters (like `/posts/:id`), payloads, query params, and responses and errors. TypeScript ensures you avoid many errors: missing payload properties, forgotten request parameters, or typos in response data. TypeScript will scream at you, and your code won’t compile until you fix the errors.

This also means you can use `tsc` in your CI pipeline to verify that your frontend remains in sync with your backend. In short, Tuyau saves you time and reduces errors.

If you’re familiar with [tRPC](https://trpc.io/), [Elysia Eden](https://elysiajs.com/eden/overview), or [Hono RPC](https://hono.dev/docs/guides/rpc), it’s the same concept.

The Tuyau client works with any stack, whether React, React Native, Vue, or Node.js. However, you will need a monorepo setup for Tuyau to function.

## Installation

To get started, install Tuyau in your AdonisJS API:

```bash
node ace add @tuyau/core
```

Then, install the client in your frontend:

```bash
npm install @tuyau/client
```

Now, you’ll need to generate the types. The `@tuyau/core` package exposes a command, `node ace tuyau:generate`, which will create a `.adonisjs/api.ts` file at the root of your AdonisJS project. This file contains all the types necessary for the client to function. This command does **not** run automatically at the moment. You will need to run it manually after certain changes in your AdonisJS project, such as:

- Adding a new route/controller in your project
- Adding a `request.validateUsing` call in your controller method

Other than that, you won’t need to run this command frequently. For example, if you update the return type of a controller method or update the Vine schema, you **don’t need** to run the command again.

Once done, you can import and configure the client in your frontend as follows:

```ts
/// <reference path="../../adonisrc.ts" />

import { createTuyau } from '@tuyau/client'
import { api } from '@your-monorepo/server/.adonisjs/api'

export const tuyau = createTuyau({
  api,
  baseUrl: 'http://localhost:3333',
})
```

You’ll need to configure your monorepo so that your frontend depends on your backend to import the `.adonisjs/api.ts` file. More information [here](https://tuyau.julr.dev/docs/installation#sharing-the-api-definition).

And that’s it! You’re ready to use Tuyau in your frontend!

## Cool Features

Tuyau comes with a lot of cool features to make your life easier. Here are some of them:

### Making Requests

Of course, making requests is the primary goal of Tuyau. Here's a quick peek at multiple request methods:

```ts
// GET /users
await tuyau.users.$get()

// POST /users { name: 'John Doe' }
await tuyau.users.$post({ name: 'John Doe' })

// PUT /users/1 { name: 'John Doe' }
await tuyau.users({ id: 1 }).$put({ name: 'John Doe' })

// GET /users/1/posts?limit=10&page=1
await tuyau.users.$get({ query: { page: 1, limit: 10 } })
```

### Typesafe Links for Inertia Apps

If you’re using Inertia.js, Tuyau provides a helper to generate typesafe links. This way, you can avoid typos in your routes and parameters. Here’s how you can use it:

```vue
<script setup lang="ts">
import { Link } from '@tuyau/inertia/vue'
</script>

<template>
  <Link route="users.posts.show" :params="{ id: 1, postId: 2 }">Go to post</Link>
</template>
```

This is also available for React.

### Ziggy-like Helpers

If you’ve used Laravel and Inertia, you’re likely familiar with Ziggy, which allows you to reference route names in your frontend instead of explicitly writing URLs. Tuyau offers similar functionality. Here’s an example:

```ts
/**
 * Backend
 */
router.get('/posts/:id/generate-invitation', '...').as('posts.generateInvitation')

/**
 * Client-side
 * Making a request using the route name
 */
await tuyau
  .$route('posts.generateInvitation', { id: 1 })
  .$get({ query: { limit: 10, page: 1 } })

/**
 * Generating the URL using the route name
 */
// http://localhost:3333/users/1/posts/2
const url = tuyau.$url('users.posts', { id: 1, postId: 2 })

// http://localhost:3333/venues/1/events/2
const url = tuyau.$url('venues.events.show', [1, 2])

// http://localhost:3333/users?page=1&limit=10
const url = tuyau.$url('users', { query: { page: 1, limit: 10 } })
```

### Typed Error Handling

Consider the following code:

```ts
/**
 * Backend
 */
class MyController {
  public async login({ request, response }) {
    const { email, password } = request.validateUsing(schema)
    if (password !== 'password') {
      return response.unauthorized({ message: 'Invalid credentials' })
    }

    return { token: 'secret-token' }
  }
}

router.post('/login', [MyController, 'login'])
```

A simple route that either returns a token or a 401 error with a `message` property.

Now, let’s call this route from our frontend with Tuyau:

```ts
const { data, error } = await tuyau
  .login
  .$post({ email: 'foo', password: 'password' })

/**
 * We have a union type between the data and the error, as 
 * we haven't yet narrowed down the type of the response.
 */
data
// ^? { token: string } | null

/**
 * Let's narrow down the type. If the error status is 401,
 * we know the error will have a message property.
 */
if (error) {
  if (error?.status === 401) {
    console.log(error.message)
    //            ^? string
  }
  return
}

/**
 * Now, we're sure the data is not null since
 * we checked for the error above.
 */
console.log(data.token)
//          ^? { token: string }
```

As you can see, Tuyau provides a clean and typesafe way to handle errors. However, if you handle errors through middleware, Tuyau will not be able to detect that. 

### Unwrapping the Response

As seen in the previous example, you need to “narrow down” the response type to access its properties. Tuyau provides an `unwrap` function if you don’t need custom error handling and just want to access the data:

```ts
const data = await tuyau
  .login
  .$post({ email: 'foo', password: 'password' })
  .unwrap()

console.log(data.token)
```

If the API call returns an error, `unwrap` will throw an exception.

### Inferring Request and Response Types

If you need to infer the input and output types of a route, you can do it like this:

```ts
import type { 
  InferResponseType, 
  InferErrorType, 
  InferRequestType 
} from '@tuyau/client';

// InferRequestType
type LoginRequest = InferRequestType<typeof tuyau.login.post>;

// InferResponseType
type LoginResponse = InferResponseType<typeof tuyau.login.post>;

// InferErrorType
type LoginError = InferErrorType<typeof tuyau.login.post>;
```

## Conclusion

Tuyau is a powerful tool for saving a lot of time and reducing errors in your frontend code. Make sure to check out the [documentation](https://tuyau.julr.dev/) for more information on how to use Tuyau in your projects.

Give it a try and please let us know if you have any feedback on [GitHub](https://github.com/Julien-R44/tuyau) !
