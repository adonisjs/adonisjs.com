---
summary: We have been working hard to refine the framework, engage with the alpha testers, and migrate more official packages to the v6 core. Today, we're thrilled to share our progress around what has been accomplished since the last update.
---


On July 24th, [we announced the availability of AdonisJS 6](https://github.com/adonisjs/core/discussions/4201) in its "alpha state" exclusively for our sponsors to explore the framework and provide valuable feedback.

Since that moment, we have been working hard to refine the framework, engage with the alpha testers, and migrate more official packages to the v6 core. Today, we're thrilled to share our progress around what has been accomplished since the last update.

If you weren't aware of the new major release of AdonisJS, you could learn more about the anticipated changes in our previous article titled ["What to Expect of AdonisJS 6?"](https://adonisjs.com/blog/what-to-expect-of-adonisjs-6). This will give you a solid understanding of the exciting enhancements that await in AdonisJS v6.

:::note

A common theme with AdonisJS v6 is de-coupling as many pieces from the framework and releasing them as framework-agnostic packages with their documentation. In this update, we continue to work towards that goal.

:::

## EdgeJS 6.0

EdgeJS is a simple, modern, battery-included template engine we've used since AdonisJS v4.

With the latest release of Edge, we have reworked some of the internals, making it twice as fast and ESM-only, all while maintaining its framework-agnostic nature.

We've also created a dedicated website, [edgejs.dev](https://edgejs.dev/), where you can find comprehensive documentation and all the information you need to explore this new version. Check out the [upgrade guide](https://edgejs.dev/docs/changelog/upgrading-to-v6) to ease your transition to EdgeJS version 6.

## Japa 3.0

Japa is a home-grown testing framework, again something we have used since AdonisJS v4.

Japa is one of the fastest testing frameworks in the Node.js ecosystem. It does not use transpilers, is significantly smaller than Vitest and Jest, and comes with many features, making testing an enjoyable experience for Node.js libraries and applications.

We introduced a significant update during this period, transitioning to Japa 3. This release incorporates several significant changes, including the shift to ESM-Only, all while retaining its framework-agnostic approach. 

For comprehensive information about Japa and its latest version, visit [japa.dev](https://japa.dev/). If you've used this package in your Node.js project, check out the [migration guide](https://japa.dev/docs/uprade-guide) to smoothly transition to the latest version.

## Lucid 19.0

Lucid is another home-grown package created and maintained by the AdonisJS core team. It is a SQL query builder and an Active Record ORM built on Knex.

Lucid 19 is a major release in which we migrate the package to ESM-Only and work smoothly with AdonisJS v6 apps. Just so you know, this release contains zero functional breaking changes. So, migrating to Lucid 19 will be a lot simpler.

Aligning with our commitment to creating framework-agnostic packages, you now have the flexibility to integrate Lucid into any of your Node.js projects.

The documentation for Lucid is not public yet because we shifted our focus toward migrating the rest of the packages. However, Lucid will soon have its dedicated documentation website.

## Everything else

In addition to our major updates, we've migrated several other essential modules to seamlessly integrate with AdonisJS 6, ensuring they remain compatible without disrupting their APIs.

### Ally

Our social authentication provider, Ally, empowers you to authenticate users via OAuth2 with third-party platforms.

### I18n

Our Internationalization and Localization provider, I18n, facilitates building applications supporting multiple languages.

### Redis

Our Redis provider simplifies working with the `ioredis` library, offering automatic management of multiple Redis connections and improved pub/sub system support for a smoother developer experience.

### Vite

Introducing Vite, our new asset bundler built on Vite, now seamlessly integrated into your AdonisJS 6 projects.

### Session

Our Session provider offers flexible management of user sessions, allowing various providers such as cookies, files, Redis, and memory storage methods.

### Shield

Our security provider helps you secure your application with CSRF protection, CSP Policy definition, HSTS, X-Frame, and MIME-type sniffer.

## What's Next?

As we move closer to the release of AdonisJS 6, we have some exciting plans on the horizon.

Firstly, we're working on migrating a few remaining modules, including Auth, Drive, Bouncer, and the Limiter module, to ensure a smooth migration experience between v5 and v6.

Additionally, we have the following packages in PoC (Proof of Concept). They still need to be completed so that we may release them post v6 official launch.

- Transmit (Championed by Romain) - Transmit will be our official package to implement natively SSE (Server-Sent Events) in AdonisJS, allowing you to build real-time applications. Additionally, you will be able to broadcast events across multiple servers or instances using the inbuilt Redis transport layer.
- Bentocache (Championed By Julien) - BentoCache will be a framework agnostic cache system for Node.js applications. BentoCache has multi-tier caching, support for multiple storage backends, Cache stamped protection, named caches, and more.

Finally, we are internally working towards a more transparent governance approach and will share the outcome with you once we have a plan.

To sum up. We're incredibly excited about these developments and look forward to sharing more updates with you soon. Together, we're shaping the future of AdonisJS, making it more powerful, accessible, and user-friendly than ever before. Stay tuned for all the incredible things yet to come!
