```ts
import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'

test('render polls created by the logged-in user', async ({ visit, browserContext }) => {
  const user = await UserFactory.with('polls', 5).create()
  
  /**
   * Mark the user as logged in
   */
  // highlight-start
  await browserContext.loginAs(user)
  // highlight-end

  /**
   * Visit the endpoint that renders the list of
   * polls for the logged-in user
   */
  // highlight-start
  const page = await visit('/me/polls')
  // highlight-end

  for (let poll in user.polls) {
    await page.assertExists(
      page.locator('h2', { hasText: poll.title })
    )
  }
})
```
