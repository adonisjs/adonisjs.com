import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import BlogPosts from '../app/collections/blog_posts.js'

export default class PublishPost extends BaseCommand {
  static commandName = 'publish:post'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const blogsPosts = new BlogPosts()
    const blogPostsList = await blogsPosts.all()
    const blogPostsListOptions = blogPostsList
      .sort((a) => (a.publishedAt === null ? 1 : -1))
      .map((post) => {
        return post.slug
      })

    const post = await this.prompt.autocomplete(
      'Select the post to publish',
      blogPostsListOptions,
      {
        multiple: false,
        limit: 10,
      }
    )

    const postToPublish = await blogsPosts.find(post)
    if (!postToPublish) {
      this.exitCode = 1
      this.logger.error(`Unable to publish post "${post}". Cannot find it inside the databse`)
    } else {
      await blogsPosts.update(postToPublish, { publishedAt: new Date().toISOString() })
      this.logger.success(`Published post ${this.colors.dim(postToPublish.slug)}`)
    }
  }
}
