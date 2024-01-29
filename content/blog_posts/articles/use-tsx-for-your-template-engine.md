---
summary: Edge is great, but maybe you want to use TSX instead. Here are some information about it.
---

Seven years ago, we decided to build Edge, our templating engine. We created it to ensure longevity, speed, and extensibility.

Edge is one of the best templating engines out there for Node.js. It is not restrictive; any JavaScript expression will work on it; it generates an accurate error stack, helping you debug your templating issue; it provides support for components with props and slots and is easily extendable. In fact, 80% of Edge is built using its public API.

We love Edge and working with it, but it brings a few caveats.

It is a "custom language". We need to have an extension for any IDE to have syntax highlighting. If we want to have type safety, we would need to create a complete LSP ((Language Server Protocol)[https://en.wikipedia.org/wiki/Language_Server_Protocol]) from scratch, which is out of the scope of this project. It also means `prettier` does not work out of the box with Edge; a custom plugin would be needed.

Those caveats may not be an issue for you, and you love us working with Edge, but let me present you another alternative for those who would like better type-safety and IDE support.

## JSX

JSX (JavaScript Syntax Extension) is an XML-like syntax extension to ECMAScript without any defined semantics developed by Facebook.

You may have already used it in React, Vue, Solid, or other frontend frameworks. While most of its use cases are inside React, JSX is not tied to it. It has [a proper spec](https://facebook.github.io/jsx/) for anyone to create and use a parser.

The great part of JSX is its support. All IDE supports JSX; it already has an LSP, a prettier support, and even TypeScript has backed-in support.

It makes it a great candidate for a templating engine.

## Examples

For those who have yet to use JSX or TSX (JSX on TypeScript file), let me show you some examples and what it may look like in your code.

First, everything is a component; you define them with a function, and the function returns JSX, which follows an HTML-like syntax.

```tsx
export function Home() {
  return (
    <div>
      <h1>Hello World</h1>
    </div>
  )
}
```

Since this code resides in a `tsx` file, it can execute any JavaScript function like a standard function.

```tsx
import { cva } from 'class-variance-authority'

interface ButtonProps { /* ... */ }

export function Button(props: ButtonProps) {
  const { color, children, size = 'medium', ...extraProps } = props
  
  const buttonStyle = cva('button', { /* ... */ }
  
  return (
    <button class={button({ color, size })} {...extraProps}>
      {children}
    </button>
  )
}
```

We use `cva` from the [class-variance-authority](https://cva.style/docs) package in this example.

We can leverage the [Async Local Storage](https://docs.adonisjs.com/guides/async-local-storage#async-local-storage) of AdonisJS to access the `HttpContext` anywhere in your template.

:::warn
 We recommend doing props drilling since using ALS will create a performance hit for your application.
:::

```tsx
export function Header() {
  const { auth } = HttpContext.getOrFail()
  
  if (auth.user) {
    return <header>Authenticated!</header>
  }
  
  return <header>Please connect!</header>
}
```

## Setting up TSX

I have tried different packages to use TSX as a templating engine; [JSXTE](https://github.com/ncpa0/jsxte) and [Kita](https://github.com/kitajs/html) were the most advanced ones.

We will use `@kitajs/html` during this tutorial, but feel free to use the one you prefer.

First, you have to install the package. At the time of writing, this package is at version `3.1.1`.

We will also install their plugin to enable editor intellisense.

```sh
npm install @kitajs/html @kitajs/ts-html-plugin
```

Once done, we will edit the `bin/server.ts` file to register Kita.

```ts
import 'reflect-metadata'
import '@kitajs/html/register.js'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

// ...
```

We must also change our `tsconfig.json` file to add JSX support.

```js
{
  // ...
  "compilerOptions": {
   // ...
   "jsx": "react",
    "jsxFactory": "Html.createElement",
    "jsxFragmentFactory": "Html.Fragment",
    "plugins": [{ "name": "@kitajs/ts-html-plugin" }]
  }
}
```

From now on, you can change the files' extension containing JSX from `.ts` to `.tsx`. For example, your route file may become `routes.tsx`.

Doing so will allow you to use JSX inside those file directly.

```tsx
import router from '@adonisjs/core/services/router'
import { Home } from 'path/to/your/tsx/file'

router.get('/', () => {
  return <Home />
})
```

## Adding global helpers

In Edge, some helpers are added by AdonisJS to make your life easier. For example, you may use the `route` helper to generate routes.

```edge
<a href="{{ route('posts.show', [post.id]) }}">
  View post
</a>
```

Again, since TSX files are JS files, you can simply define those functions anywhere in your codebase and then import them.

```ts
import router from '@adonisjs/core/services/router'

export function route(...args: Parameters<typeof router.makeUrl>) {
  return router.makeUrl(...args)
}
```

```tsx
import { route } from '#start/view'

<a href="{route('posts.show', [post.id])}">
  View post
</a>
```

### Examples of some helpers

```ts
import vite from '@adonisjs/vite/services/main'
import router from '@adonisjs/core/services/router'
import { HttpContext } from '@adonisjs/core/http'

export function route(...args: Parameters<typeof router.makeUrl>) {
  return router.makeUrl(...args)
}

export function csrfField() {
  // Note the usage of ALS here.
  const { request } = HttpContext.getOrFail()

  return Html.createElement('input', { type: 'hidden', value: request.csrfToken, name: '_csrf' })
}

function Image(props: { src: string; alt?: string; class?: string }) {
  const url = vite.assetPath(props.src)

  return Html.createElement('img', { src: url, alt: props.alt, class: props.class })
}

function ScriptAsset(props: { entrypoint: string }) {
  const assets = vite.generateEntryPointsTags(props.entrypoint)

  const elements = assets.map((asset) => {
    if (asset.tag === 'script') {
      return Html.createElement('script', {
        ...asset.attributes,
      })
    } else {
      return Html.createElement('link', {
        ...asset.attributes,
      })
    }
  })

  return Html.createElement(Html.Fragment, {}, elements)
}
```
