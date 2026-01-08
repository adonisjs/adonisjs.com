---
summary: Built a production checkout flow in one evening with Claude. It worked because the framework had already made the hard decisions. AI filled in the rest.
---

A few days ago, I built the entire AdonisJS Plus checkout flow and admin area from scratch. Not a demo or a toy app, but a real system with Polar checkout, a resilient resumable fulfillment pipeline, an admin UI to manage users, orders, and sessions, manual fulfillment controls, email flows, and authentication with forgot password.

::video{src="https://res.cloudinary.com/adonis-js/video/upload/v1767865978/plus-time-lapse_dpn0xc.mp4" controls="true"}

<br />

What you are seeing above is the unskinned version (not the final UI) and it took one evening. I used Claude heavily throughout, and the results were surprisingly good.

Afterwards, I found myself thinking about why it went so smoothly. The answer, I think, comes down to how little decision-making the AI actually had to do.

## The framework had already made the hard decisions

Auth, sessions, and security were already handled. The same was true for background jobs and email flows. Everything had a place.

AI didn't have to figure out which auth library to use, or how to structure background jobs, or where validation logic should live. Those decisions were already made. The framework provided the patterns. AI just filled them in.

That's a very different task than asking AI to compose a system from scratch using dozens of independent libraries. In that scenario, every decision branches endlessly. Which auth library? Which validation approach? Which email abstraction? Which job queue semantics? The AI doesn't get smarter here. It just gets noisier, and the resulting system ends up with inconsistent abstractions, conflicting conventions, and implicit coupling that no one explicitly designed.

## Guardrails, not limitations

A batteries-included framework gives AI something it desperately needs: **guardrails**.

Opinionated frameworks encode decisions about where code lives, how data flows, how side effects are handled, and how state is managed. This creates a predictable structure. AI performs dramatically better when the structure is stable, explicit, and repeated across projects. The more predictable the system, the better the output.

There's another thing worth noting. A stack of best-in-class libraries doesn't equal a best-in-class system. Frameworks optimize for coherence, not individual brilliance. You get consistent error handling, shared lifecycle hooks, integrated security assumptions, and predictable extension points. AI thrives when the system behaves as a whole, not as a bag of parts.

## A natural pairing

I came away from this experience thinking that batteries-included frameworks and AI workflows are a natural pairing.

The framework handles the structural decisions, the conventions, the integration points. AI handles the implementation details, the boilerplate, the filling-in of established patterns. Neither is doing the other's job. They're complementary.

As we move toward more agentic development and AI-assisted refactors, I suspect this pairing will become more important. AI makes it easy to build something quickly. A good framework makes it possible to build the right thing, repeatedly, without losing control.

That evening building the checkout flow was a small example, but it left me convinced: batteries-included frameworks aren't slowing down AI workflows. They're accelerating them.
