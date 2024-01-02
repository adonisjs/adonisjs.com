import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type authors from '../../content/authors/db.json'

export type Author = (typeof authors)[number]

/**
 * Authors refers to blog posts authors
 */
export default class Authors extends BaseCollection<Author> {
  uid: keyof Author = 'username'
  viteAssets: (keyof Author)[] = ['profilePictureUrl']
  dbFilePath: string = app.makePath('content/authors/db.json')
}
