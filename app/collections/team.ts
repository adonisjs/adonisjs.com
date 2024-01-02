import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type team from '../../content/team/db.json'

export type TeamMember = (typeof team)[number]

/**
 * Team collection represents core team members
 */
export default class Team extends BaseCollection<TeamMember> {
  uid: keyof TeamMember = 'name'
  viteAssets: (keyof TeamMember)[] = ['profilePictureUrl']
  dbFilePath: string = app.makePath('content/team/db.json')
}
