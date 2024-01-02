import type { HttpContext } from '@adonisjs/core/http'
import BlogPosts from '../collections/blog_posts.js'

export default class BlogController {
  index({ view }: HttpContext) {
    return view.render('pages/blog/list', {
      blogPosts: new BlogPosts(),
    })
  }

  list() {
    return new BlogPosts().published()
  }

  async show({ view, params, response }: HttpContext) {
    const post = await new BlogPosts().find(params.slug)
    if (!post) {
      return response.notFound('Post not found')
    }

    return view.render('pages/blog/show', {
      blogPost: post,
    })
  }
}
