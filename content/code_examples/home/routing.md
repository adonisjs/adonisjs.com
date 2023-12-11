```ts
import router from '@adonisjs/core/services/router'
import PostsController from '#controllers/posts_controller'

router.get('posts', [PostsController, 'index'])
router.post('posts', [PostsController, 'store'])
router.get('posts/:id', [PostsController, 'show'])
```
