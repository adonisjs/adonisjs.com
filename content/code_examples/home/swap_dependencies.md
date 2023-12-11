```ts
import { test } from '@japa/runner'
import app from '@adonisjs/core/services/app'
import PaymentsService from '#services/payments_service'

test('list user payments', async ({ client }) => {
  /**
   * Using IoC container to swap the PaymentsService
   * with an instance of a FakePayments service
   */
  const fakePaymentsService = new FakePaymentsService()
  await app.container.swap(PaymentsService, () => {
    return fakePaymentsService
  })

  // Visit API endpoint
  const response = await client.get('/users/1/payments')

  /**
   * Assert the response.payments matches the fake
   * payments service data
   */
  response.assertBodyContains({
    payments: await fakePaymentsService.getPayments()
  })
})
```
