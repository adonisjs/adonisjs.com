import dayjs from 'dayjs'
import app from '@adonisjs/core/services/app'

import Authors from './authors.js'
import BaseCollection from './base.js'
import type authors from '../../content/authors/db.json'
import type blogPosts from '../../content/blog_posts/db.json'

export type Author = (typeof authors)[number]
export type BlogPost = Omit<(typeof blogPosts)[number], 'publishedAt'> & {
  publishedAt: null | string
}

export default class BlogPosts extends BaseCollection<BlogPost> {
  uid: keyof BlogPost = 'slug'
  dates: ['publishedAt'] = ['publishedAt']
  dbFilePath: string = app.makePath('content/blog_posts/db.json')
  authors = new Authors()

  /**
   * Inlining author with the blog post
   */
  protected async processEntry(entry: unknown): Promise<void> {
    await super.processEntry(entry)

    const processedEntry = entry as BlogPost & { author: Author | null }
    processedEntry.author = await this.authors.find(processedEntry.authorName)
  }

  /**
   * Returns list of all the published posts
   */
  async published() {
    const blogPosts = await super.all()
    return blogPosts
      .filter((post) => post.publishedAt !== null)
      .sort((a, b) => (dayjs(a.publishedAt).isAfter(b.publishedAt) ? -1 : 1))
  }
}
