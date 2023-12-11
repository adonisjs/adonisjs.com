```ts
import Post from '#models/post'
import { HttpContext } from '@adonisjs/core/http'
import { createPostValidator } from '#validators/posts'

export default class PostsController {
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    return Post.query().paginate(page)
  }

  async store({ request }: HttpContext) {
    const payload = await request.validateUsing(createPostValidator)
    return Post.create(payload)
  }

  async show ({ params }: HttpContext) {
    return Post.findOrFail(params.id)
  }
}
```
