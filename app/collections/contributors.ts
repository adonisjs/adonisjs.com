import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type contributor from '../../content/contributors/db.json'

export type Contributor = (typeof contributor)[number]

/**
 * Contributors collection represents individuals who have
 * contributed on Github.
 */
export default class Contributors extends BaseCollection<Contributor> {
  uid: keyof Contributor = 'username'
  dbFilePath: string = app.makePath('content/contributors/db.json')
}
