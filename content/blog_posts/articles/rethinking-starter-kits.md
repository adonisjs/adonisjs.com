---
summary: A look at the new Hypermedia Starter Kit for AdonisJS v7 — unstyled base components, simple auth flows, and the philosophy behind building minimal, reusable foundations instead of feature-heavy templates.
---

We have recently updated the [**Hypermedia Starter Kit** for **AdonisJS v7**](https://insiders.adonisjs.com/changelog).
This release includes a set of **base components** — such as buttons, form fields, avatars, and layouts — along with a **simple signup and login system** to help you get started quickly.

In this article, we will first look at what's new, then discuss the philosophy behind these changes.

## Base Components

Every AdonisJS app needs a handful of consistent building blocks, such as form fields, buttons, and layouts.
These are simple elements, but they often take time to set up correctly when starting a new project.

The new starter kit provides **unstyled components** for these common cases.
They focus on structure and semantics, leaving the visual layer entirely up to you.

Here's an example of how the new form components can be composed:

```edge
@form({ route: 'session.store', method: 'POST' })
  <div>
    @field.root({ name: 'email' })
      @!field.label({ text: 'Email' })
      @!input.control({ type: 'email' })
      @!field.error()
    @end
  </div>

  <div>
    @field.root({ name: 'password' })
      @!field.label({ text: 'Password' })
      @!input.control({ type: 'password' })
      @!field.error()
    @end
  </div>

  <div>
    @!button({ text: 'Login', type: 'submit' })
  </div>
@end
```

There are a few details worth noting:

- The `@form` component accepts both the route name and its parameters as props. This means you no longer need to use the `urlFor` helper to manually compute route URLs.

- CSRF protection is handled automatically — you don't need to include the token yourself.

- Form method spoofing is also built in. When you set the method to `PUT`, `PATCH`, or `DELETE`, the component will handle it internally.

- The `@!field.error()` tag automatically reads and displays the validation error for its parent field defined using the `@field.root` component.

## Login and Signup Flows

The starter kit includes minimal **login** and **signup** pages.
They are intentionally simple, providing just enough to authenticate users and move forward with the rest of your application.

This approach lets you build the core features of your app first — since most of the app depends on a logged-in user, not a fully polished authentication system. 

Security and edge cases can be improved later without blocking progress on the rest of the product.

::video{src="https://res.cloudinary.com/adonis-js/video/upload/v1761292002/auth-flows-hypermedia_noglrm.mp4" controls="true"}

## Why This Direction

Developers use AdonisJS because it helps them move faster while maintaining structure and consistency. 

The framework already provides low-level APIs and first-party packages for everyday backend needs — validation, email, file uploads, authentication, rate limiting, and so on.

However, even with these tools, developers still spend time building the same UI patterns and flows in every project.
While this is not the framework's responsibility, certain parts rarely change between apps:

* Rendering forms with CSRF protection
* Displaying field-level errors
* Showing a user avatar with fallback initials
* Wrapping pages in a layout

These patterns are repetitive, and our goal is to remove that repetition by defining a minimal set of reusable base components in every starter kit.

## Keeping It Minimal

We are careful not to turn these starter kits into rigid, pre-built templates.
Many starter projects in the JavaScript ecosystem bundle multiple tools together with complex or opinionated structures, which can be hard to maintain or extend.

Our goal is the opposite. We value clean code, predictable structure, and minimal dependencies.

Components in our Starter Kits are designed to be composable and straightforward, with no styling or external requirements.

## Addition Over Deletion

We design everything in the starter kits so that you add your own code, not remove ours.
None of the components include CSS classes or visual opinions.

Starter kits do ship with a small CSS file that adds neutral defaults using tag selectors. It exists to make the first render look consistent, but we expect most developers to replace it with their own design system.

The starter kit is meant to be a foundation — a clean, functional starting point that helps you begin building immediately without introducing unnecessary complexity.

## Conclusion

:::note
AdonisJS v7 is currently in closed preview, [available to Insiders](https://insiders.adonisjs.com/) who are helping us refine and stabilize the release.

The updated starter kits, including Hypermedia, are part of this preview. Their feedback will shape the final versions that ship with the public release of v7.
:::

A good starter kit should not aim to be feature-rich.
It should give you a reliable base to build on, with the flexibility to grow your own design and structure over time.

The new Hypermedia Starter Kit for AdonisJS v7 follows that principle.
It focuses on clarity, reusability, and simplicity — so you can start with a strong foundation and build the rest your own way.
