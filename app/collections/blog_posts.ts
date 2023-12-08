import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type blogPosts from '../../content/blog_posts/db.json'

export type BlogPost = Omit<(typeof blogPosts)[number], 'publishedAt'> & {
  publishedAt: null | string
}

export default class BlogPosts extends BaseCollection<BlogPost> {
  uid: keyof BlogPost = 'slug'
  dbFilePath: string = app.makePath('content/blog_posts/db.json')
}
