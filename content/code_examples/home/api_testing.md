```ts
import { test } from '@japa/runner'
import { UserFactory } from '#factories/user_factory'

test('get list of expenses for the logged-in user', async ({ client }) => {
  const user = await UserFactory.with('expenses', 10).create()

  /**
   * Login user and visit the API endpoint to
   * get the list of expenses
   */
  const response = await client
    .get('/me/expenses')
    .loginAs(user)

  /**
   * Assert response matches the schema defined
   * in an OpenAPI schema file
   */
  // highlight-start
  response.assertAgainstApiSpec()
  // highlight-end
  response.assertBodyContains(user.expenses.toJSON())
})
```
