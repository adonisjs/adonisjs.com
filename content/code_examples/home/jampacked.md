```ts
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

router.put('me/avatar', async ({ request }) => {
  const avatar = request.file('avatar', {
    extnames: ['jpg', 'png'],
    size: '2mb'
  })

  await avatar.move('uploads')
  return avatar
})

router
  .get('/users/:id', async ({ params }) => {
    return User.findByOrFail(params.id)
  })
  .use(middleware.auth())
```
