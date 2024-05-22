---
summary: Transmit is a new package in the AdonisJS family. Its goal is to provide an opinionated way of using SSE.
---

Transmit is a new package in the AdonisJS family. Its goal is to provide an opinionated way of using [Server-Sent-Events (SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events).

SSE allows you to send real-time updates to your clients, such as notifications, live chat messages, or any other type of real-time data you may consider.

## What is SSE ?

First of all, Server-Sent-Events is not new. It has been out and backed in browsers for nearly two decades.

It is relatively easy to understand how it works.

By default, when the browser sends an HTTP request to your backend, you will send back a response with JSON, HTML, or whatever you want. When using SSE, you do not end the response; you keep it open, like a stream.

Doing this will allow your backend to send data over time by writing to the open stream.

:::note
**When not used over HTTP/2**, SSE suffers from a limitation to the maximum number of open connections, which can be specially painful when opening various tabs as the limit is per browser and set to a very low number (6).
:::

## Difference from WebSocket

I know many people relies on WebSocket to handle any real-time needs.. While it is working, you may not need it.

There are two main differences between WebSocket and SSE:

1. Data transmission occurs only from server to client, not the other way around. You have to use a form or a fetch request to achieve client-to-server communication. Using WebSocket creates a duplex connection, where the client can also push data to the server.
2. SSE uses the HTTP stack. You will be able to use middleware to authenticate your users.

Since SSE is way simpler to use and set up, you should use it instead of WebSocket if your goal is to send notifications to your client, like Flash messages.

## Transmit opinion

As said in the beginning, Transmit is an opinionated way of leveraging SSE.

There is no standard protocol built on top of it. The [specification](https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events) only talks about how the data sent must be structured. Some people created an external hub named [Mercure](https://mercure.rocks/) to make SSE easy that you can also use inside your application.

At AdonisJS, we decided to leverage the Node.js capabilities to create and consume streams to build our own protocol that allows a perfect integration inside your AdonisJS codebase and makes working with SSE a breeze.
 
When creating a Transmit instance in your client, you open one connection to your Transmit endpoint (added by the Transmit package). This connection will be used to send any messages you would like to broadcast.

```ts
const transmit = new Transmit({
  baseUrl: window.location.origin
})
```

From there, your client can register to channels, private or not, to receive events from them.

For example, the user `romain.lanz` may register to the channel `users/romain.lanz`, a private channel only accessible to him.

```ts
const subscription = transmit.subscription('users/romain.lanz')
await subscription.create()
```

Then, I can define what I want to do when this channel receives a message.

```ts
subscription.onMessage((data) => {
  console.log(data)
})
```

You can create as many subscriptions as you want; they will all be linked to the same opened connection. We take care of calling the right listener for the right event.

## Sending events from the backend

You can send events from your backend with only one line of code.

```ts
import transmit from '@adonisjs/transmit/services/main'

transmit.broadcast('users/romain.lanz', { message: 'Hello' })
```

This code can be placed at any place in your codebase. We have a [syncing layer](https://docs.adonisjs.com/guides/digging-deeper/transmit#syncing-across-multiple-servers-or-instances) in place to allow Transmit to work when running multiple servers or instances.


### Syncing layer

Since we keep a connection open in memory, you cannot broadcast any message to your client outside of the same process.

For example, if you run a job inside a queue, you cannot call `transmit.broadcast` to notify your client that the process ended.

But if you activate the syncing layer, a `Message Bus` will ensure your message is broadcast wherever you call `transmit.broadcast`.

## Conclusion

We hope this new package will help you write better application with easy access to real-time capabilities but without the hassle of managing a WebSocket server.

In case you encounter any issues, feel free to reach out to us on [GitHub](https://github.com/orgs/adonisjs/discussions) or our [Discord Server](https://discord.gg/vDcEjq6).
