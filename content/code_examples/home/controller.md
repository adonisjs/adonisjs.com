```sh
node ace make:controller posts
```

```ts
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({}: HttpContext) {
    // we want to return a paginated list of posts
  }

  async store({}: HttpContext) {
    // we want to save a post
  }

  async show({}: HttpContext) {
    // we want to return a post by its id
  }
}
```
