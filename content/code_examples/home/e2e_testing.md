```ts
import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'

test('list logged-in user polls', async ({ visit, browserContext }) => {
  // Setup state
  const user = await UserFactory.with('polls', 5).create()
  
  // Login user
  await browserContext.loginAs(user)

  // Visit page
  const page = await visit('/me/polls')

  // Assert all polls exists
  for (let poll in user.polls) {
    await page.assertExists(
      page.locator('h2', { hasText: poll.title })
    )
  }
})
```
