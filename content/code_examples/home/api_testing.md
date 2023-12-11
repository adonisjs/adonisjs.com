```ts
import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'

test('list logged-in user expenses', async ({ client }) => {
  // Setup state
  const user = await UserFactory.with('expenses', 10).create()

  // Make API request
  const response = await client.get('/me/expenses').loginAs(user)

  // Assert against OpenAPI spec
  response.assertAgainstApiSpec()

  // Assert values
  response.assertBodyContains(user.expenses.toJSON())
})
```
