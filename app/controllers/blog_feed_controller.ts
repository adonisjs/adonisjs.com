import type { HttpContext } from '@adonisjs/core/http'
import BlogPosts from '../collections/blog_posts.js'

export default class BlogFeedController {
  async handle({ view, response }: HttpContext) {
    response.append('Content-Type', 'text/xml')

    const publishedBlogPosts = await new BlogPosts().published()

    // Only publish the most recent 20 posts
    const feedBlogPosts = publishedBlogPosts.slice(0, 20)

    return view.render('feeds/blog', {
      blogPosts: feedBlogPosts,
    })
  }
}
