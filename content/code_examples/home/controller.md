```sh
node ace make:controller posts
```

```ts
import type { HttpContext } from '@adonisjs/core/http'

export default class PostsController {
  async index({}: HttpContext) {
    // return list of posts
  }

  async store({}: HttpContext) {
    // save post
  }

  async show({}: HttpContext) {
    // return post by id
  }
}
```
