---
summary: Transmit is a new package in the AdonisJS family. Its goal is to provide an opinionated way of using SSE.
---

Transmit is a new package in the AdonisJS family. Its goal is to provide an opinionated way of using [Server-Sent Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

SSE allows you to send real-time updates to your clients, such as notifications, live chat messages, or any other type of real-time data you might need.

:::note
Learn more about Transmit inside the [official documentation](https://docs.adonisjs.com/guides/digging-deeper/transmit).
:::

::video{url="/transmit-example.mp4"}

## What is SSE?

First of all, Server-Sent-Events is not new. It has been available and supported in browsers for nearly two decades.

It is relatively easy to understand how it works.

By default, when the browser sends an HTTP request to your backend, you send back a response with JSON, HTML, or any other type of data. When using SSE, you do not end the response; you keep it open, like a stream.

This allows your backend to send data continuously over time by writing to the open stream.

:::note
**When not used over HTTP/2**, SSE suffers from a limitation to the maximum number of open connections, which can be specially painful when opening various tabs as the limit is per browser and set to a very low number (6).
:::

## Difference from WebSocket

Many people rely on WebSocket to handle real-time needs. While it works well, you might not always need it.

There are two main differences between WebSocket and SSE:

1. Data transmission with SSE occurs only from server to client, not the other way around. For client-to-server communication, you need to use a form or a fetch request. WebSocket, on the other hand, creates a duplex connection, allowing the client to also push data to the server.
2. SSE uses the HTTP stack, enabling you to use middleware to authenticate your users.

Since SSE is much simpler to use and set up, you should use it instead of WebSocket if your goal is to send notifications to your clients, such as flash messages.

## Transmit opinion

As mentioned earlier, Transmit is an opinionated way of leveraging SSE.

There is no standard protocol built on top of SSE. The [specification](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events) only describes how the data must be structured.

One popular solution for making SSE easy to use is [Mercure](https://mercure.rocks/), an open-source hub built to be used as an external API with any languages.

At AdonisJS, we decided to leverage Node.js capabilities to create and consume streams, building our own protocol that integrates perfectly with your AdonisJS codebase and makes working with SSE a breeze.

When creating a Transmit instance in your client, you open one connection to your Transmit endpoint (added by the Transmit package). This connection will be used to send any messages you want to broadcast.

```ts
const transmit = new Transmit({
  baseUrl: window.location.origin
})
```

From there, your client can subscribe to channels, whether private or public, to receive events from them.

For example, the user `romainlanz` may subscribe to the channel `users/romainlanz`, a private channel only accessible to him.

```ts
const subscription = transmit.subscription('users/romainlanz')
await subscription.create()
```

Then, you can define what you want to do when this channel receives a message.

```ts
subscription.onMessage((data) => {
  console.log(data)
})
```

You can create as many subscriptions as you want; they will all be linked to the same open connection. We handle calling the right listener for the right event.

## Creating private channels

You can add an authorization layer before a client can subscribe to a channel. This is done by calling the `authorizeChannel` method on the Transmit instance and passing the "path" of the channel you want to secure. Then, you can return a boolean or a promise resolving to a boolean to allow or deny access.

Here is an example where we authorize access to a channel based on the user's permissions.

```ts
transmit.authorizeChannel<{ id: string }>('chats/:id/messages', async (ctx: HttpContext, { id }) => {
  const chat = await Chat.findOrFail(+id)

  return ctx.bouncer.allows('accessChat', chat)
})
```

## Sending events from the backend

You can send events from your backend with just one line of code.

```ts
import transmit from '@adonisjs/transmit/services/main'

transmit.broadcast('users/romain.lanz', { message: 'Hello' })
```

You can place this code anywhere in your codebase. We have a [syncing layer](https://docs.adonisjs.com/guides/digging-deeper/transmit#syncing-across-multiple-servers-or-instances) in place to ensure Transmit works seamlessly when running multiple servers or instances.

### Syncing layer

Since we keep a connection open in memory, you cannot broadcast any messages to your client outside of the same process.

For example, if you run a job inside a queue, you cannot call `transmit.broadcast` to notify your client that the process has ended.

However, if you activate the syncing layer, a `Message Bus` will ensure your message is broadcast no matter where you call `transmit.broadcast`.

## Conclusion

We hope this new package will help you write better applications with easy access to real-time capabilities without the hassle of managing a WebSocket server.

If you encounter any issues, feel free to reach out to us on [GitHub](https://github.com/orgs/adonisjs/discussions) or our [Discord Server](https://discord.gg/vDcEjq6).
