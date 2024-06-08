import type { HttpContext } from '@adonisjs/core/http'
import BlogPosts from '../collections/blog_posts.js'

export default class BlogFeedController {
  handle({ view, response }: HttpContext) {
    response.append('Content-Type', 'text/xml')

    return view.render('feeds/blog', {
      blogPosts: new BlogPosts(),
    })
  }
}
