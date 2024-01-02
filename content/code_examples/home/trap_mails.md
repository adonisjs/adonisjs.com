```ts
import { test } from '@japa/runner'
import mail from '@adonisjs/mail/services/main'
import VerifyEmailNotification from '#mails/verify_email'

test('create user account', async ({ client }) => {
  /**
   * Fake emails before executing the code that
   * triggers emails
   */
  // highlight-start
  const { mails } = mail.fake()
  // highlight-end

  const response = await client.post('users').json({
    email: 'virk@adonisjs.com',
    password: 'secret',
  })

  response.assertStatus(201)

  /**
   * Assert an email was sent after making the request
   * to the "/users" endpoint
   */
  // highlight-start
  mails.assertSent(VerifyEmailNotification, ({ message }) => {
    return message
      .hasTo('virk@adonisjs.com')
      .hasSubject('Verify email address')
  })
  // highlight-end
})
```
