import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type tweets from '../../content/tweets/db.json'

export type Tweet = (typeof tweets)[number]

/**
 * Collection of tweets to display in wall of love
 */
export default class Tweets extends BaseCollection<Tweet> {
  uid: keyof Tweet = 'name'
  viteAssets: (keyof Tweet)[] = ['profilePictureUrl']
  dbFilePath: string = app.makePath('content/tweets/db.json')
}
