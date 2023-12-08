import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import Authors from '../app/collections/authors.js'
import BlogPosts from '../app/collections/blog_posts.js'

export default class CreatePost extends BaseCommand {
  static commandName = 'create:post'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  /**
   * Displays a series of prompts to create a new author
   */
  protected async createNewAuthor(authors: Authors) {
    const authorsList = await authors.all()

    const username = await this.prompt.ask('Choose username (Must be URL friendly)', {
      validate(value) {
        return authorsList.find((user) => user.username === value)
          ? 'Username is already in use'
          : true
      },
    })

    const profilePictureUrl = `./avatars/${username}.png`
    const displayName = await this.prompt.ask('Enter full name')
    await authors.create({ username, displayName, profilePictureUrl })
    await authors.refresh()

    this.logger.success(
      `User created with username (${this.colors.dim(
        username
      )}). Make sure upload the profile picture inside the "authors/avatars" folder`
    )
    return username
  }

  /**
   * Displays a series of prompts to create a new post
   */
  protected async createNewPost(authors: Authors) {
    const authorsList = await authors.all()
    const authorPromptOptions = authorsList
      .map((author) => {
        return {
          message: `${author.displayName} (${author.username})`,
          name: author.username,
        }
      })
      .concat([{ name: 'create_new', message: 'Create new author' }])

    let selectedAuthor = await this.prompt.choice(
      'Select the author for the article',
      authorPromptOptions
    )

    /**
     * Create new author when selected username === "create_new"
     */
    if (selectedAuthor === 'create_new') {
      selectedAuthor = await this.createNewAuthor(authors)
    }

    const title = await this.prompt.ask('Enter post title')
    const slug = await this.prompt.ask('Enter prompt slug (URL friendly)')
    const category = await this.prompt.choice('Select category', ['News', 'Philosophy', 'Tutorial'])

    const blogPosts = new BlogPosts()
    await blogPosts.create(
      {
        title,
        slug,
        authorName: selectedAuthor,
        content: `./articles/${slug}.md`,
        publishedAt: null,
        category: category,
      },
      true
    )

    this.logger.success(
      `Post created. Open "${this.colors.dim(`blog_posts/articles/${slug}`)}.md" file to edit`
    )
  }

  async run() {
    const authors = new Authors()
    await this.createNewPost(authors)
  }
}
