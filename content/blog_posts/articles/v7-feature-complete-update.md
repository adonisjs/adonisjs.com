---
summary: AdonisJS v7 has reached its final form with stable APIs, revamped documentation, and a small breaking changes surface. Insiders can start building today.
---

We're thrilled to announce that AdonisJS v7 has reached its final form and is now available for Insiders in closed preview. **If you're a sponsor, head over to [insiders.adonisjs.com](https://insiders.adonisjs.com/) to access the documentation and start building with v7 today**.

If you've been following along with the [alpha releases](https://insiders.adonisjs.com/changelog), you already know that your feedback has been instrumental in shaping what v7 has become. Thank you for being part of this journey.

The APIs are stable and locked. The documentation has been completely revamped with significantly better coverage. v7 is ready.

The surface of breaking changes is small. We expect most apps to migrate to v7 within 30 minutes to an hour.

## Highlights

The full changelog and upgrade guides will be published during the public release, but here's a glimpse of what's new:

- **E2E type-safety for Inertia.** Full type-safety when working with Inertia, including support for separate frontend and backend applications.
- **E2E type-safety during tests.** Your test suites now benefit from the same type-safety guarantees as your application code.
- **Type-safe URL builder.** Build URLs with confidence on both the frontend and backend.
- **Type-safe Inertia components.** The Form and Link components for React and Vue are now fully typed.
- **Starter kits.** New starter kits ship with basic signup and login flows out of the box.
- **Zero-config OpenTelemetry.** Observability without the configuration headache.
- **Encryption module overhaul.** Multiple drivers and support for key rotation.
- **Lucid schema generation.** Generate your model schemas automatically, eliminating the need to manually define every column.
- **LLM.txt file.** The entire documentation is available in a single file for LLM consumption.
- **DX improvements.** Numerous quality-of-life enhancements throughout the framework.

And there's more that we'll reveal during the public release.

## Previous announcements

- [Roadmap to AdonisJS 7](./roadmap-to-adonisjs-7)
- [Rethinking Starter Kits in AdonisJS](./rethinking-starter-kits)
- [AdonisJS v7: State of Things](./adonisjs-v7-progress-update)
- [Supporting Platform-Native Response and ReadableStream in AdonisJS](./adonisjs-native-response-readablestream-support)
- [OpenTelemetry for AdonisJS](./introduction-adonisjs-opentelemetry)

## The Road Ahead

We'll spend the next few weeks in closed preview, polishing any rough edges that surface. Your feedback during this period is invaluable.

Looking beyond v7, queues and a scheduler are next on the roadmap. We've already begun laying the groundwork over at [boringnode/queue](https://github.com/boringnode/queue). You can follow our progress and see what else is planned on the [GitHub roadmap](https://github.com/orgs/adonisjs/projects/8).

We're keeping this post brief intentionally. There's much more to share, and we'll save the deep dives for the public release. For now, we hope you enjoy exploring v7.

See you on the other side.
