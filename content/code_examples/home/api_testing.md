```ts
import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'

test('list logged-in user expenses', async ({ client }) => {
  // Setup state
  const user = await UserFactory.with('expenses', 10).create()

  // Make an API request
  const response = await client.get('/me/expenses').loginAs(user)

  // Assert using OpenAPI spec
  response.assertAgainstApiSpec()

  // Assert response data
  response.assertBodyContains(user.expenses.toJSON())
})
```
