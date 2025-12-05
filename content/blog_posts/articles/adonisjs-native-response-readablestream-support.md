---
summary: AdonisJS v7 now supports platform-native Response and ReadableStream. Build AI chat apps with Vercel AI SDK and stream real-time updates with zero boilerplate.
---

We've added support for returning platform-native [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response) objects and [`ReadableStream`](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream) instances directly from your route handlers. Previously, you could only return data through AdonisJS's own response helpers, but now you can work with web platform standards directly.

Here's a quick example of the same.

```typescript
import router from '@adonisjs/core/services/router'

router.get('/stream', async () => {
  return new Response('Hello', { status: 200 })
})

router.get('/data', async ({ response }) => {
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue('chunk 1')
      setTimeout(() => {
        controller.enqueue('chunk 2')
        controller.close()
      }, 2000)
    },
  })

  return response.stream(stream)
})
```

Using these APIs directly doesn't offer much benefit over AdonisJS's response helpers for typical tasks. Let's compare these two approaches.

**More verbose with native Response**

```typescript
import router from '@adonisjs/core/services/router'

router.get('/users/:id', async ({ params }) => {
  const user = await User.find(params.id)
  return new Response(JSON.stringify(user), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  })
})
```

**Clean and simple with AdonisJS helpers**

```ts
import router from '@adonisjs/core/services/router'

router.get('/users/:id', async ({ params, response }) => {
  const user = await User.find(params.id)
  return response.json(user)
})
```

AdonisJS response helpers handle automatic serialization and set proper headers. For standard API responses, views, redirects, and file downloads, you'll want to keep using what AdonisJS provides.

The real value comes when working with third-party libraries built around native web APIs. Many modern JavaScript libraries (especially those designed to work across multiple frameworks and runtimes) are built on web standards like `Response` and `ReadableStream`. These libraries don't know about AdonisJS's helpers, and they return native objects that should "just work" in any JavaScript environment.

## Building an AI Chat with Vercel AI SDK
Let's see the value of supporting platform-native APIs in action. Given, how trendy AI is these days, let's build our own poor's man ChatGPT style app that progressively stream messages and render them as markdown.

For this, we will use the [Vercel's AI SDK](https://ai-sdk.dev/docs/introduction) as it is built around platform-native APIs and streams AI responses using `ReadableStream`.

:::note

This example uses the React starter kit from AdonisJS v7, which is not publicly available yet. However, if you an Insider, you can follow the [Insiders docs](https://insiders.adonisjs.com/docs/v7-alpha/introduction) to create a new Inertia-React app before following along.

:::

First, install the Vercel AI SDK.

```bash
npm install ai @ai-sdk/openai
```

Add your OpenAI API key to `.env`.

```dotenv
OPENAI_API_KEY=your_api_key_here
```

And copy-paste the following route to the `start/routes.ts` file. The `streamText` function returns an object with a `toUIMessageStreamResponse()` method that creates a native `Response` with a `ReadableStream` body. AdonisJS recognizes this and streams the AI's output directly to your client.

```ts
import { openai } from '@ai-sdk/openai'
import router from '@adonisjs/core/services/router'
import { convertToModelMessages, streamText, type UIMessage } from 'ai'

router.on('/').renderInertia('home', {}).as('home')

router.post('api/chat', async ({ request }) => {
  const { messages }: { messages: UIMessage[] } = request.only(['messages'])

  const result = streamText({
    model: openai('chatgpt-4o-latest'),
    messages: convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
})
```

Now, let's update the `pages/home.tsx` component and use the `useChat` hook from the `@ai-sdk/react` package. Also, we will have to convert the streamed markdown parts on the go and for that we will use the `streamdown` package.

```sh
npm i streamdown @ai-sdk/react
```

```tsx
import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { Streamdown } from 'streamdown'

export default function Home() {
  const [input, setInput] = useState('')
  const { messages, sendMessage } = useChat({})

  return (
    <>
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="chat-message">
            {message.role === 'user' ? 'User: ' : 'AI: '}
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <Streamdown key={`${message.id}-${i}`}>{part.text}</Streamdown>
              }
            })}
          </div>
        ))}
      </div>

      <div className="chat-form">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage({ text: input })
            setInput('')
          }}
        >
          <input
            value={input}
            placeholder="Say something..."
            onChange={(e) => setInput(e.currentTarget.value)}
          />
        </form>
      </div>
    </>
  )
}
```

That's all we need!. Let's give this a try by starting the development server. `node ace serve --hmr`.

::video{src="https://res.cloudinary.com/adonis-js/video/upload/v1764919962/streaming-ai-chat_byll5w.mp4" controls="true"}

## Wrapping Up

Adding native `Response` and `ReadableStream` support means AdonisJS can integrate seamlessly with libraries built on web standards. 

You'll continue using AdonisJS's response helpers for everyday tasks. They're more convenient and handle all the common cases beautifully. But when you need to work with libraries like the Vercel AI SDK or implement streaming patterns like SSE, you can do so without writing adapter code. The library returns a native object, and AdonisJS just works with it.

This makes AdonisJS a better fit for modern applications that need to integrate with the broader JavaScript ecosystem while keeping the framework's developer-friendly approach for everything else.
