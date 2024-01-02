import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type featuredSponsors from '../../content/featured_sponsors/db.json'

export type FeaturedSponsor = (typeof featuredSponsors)[number]

/**
 * Represents a collection of featured sponsors via the
 * support program.
 */
export default class FeaturedSponsors extends BaseCollection<FeaturedSponsor> {
  uid: keyof FeaturedSponsor = 'name'
  inlineAssets: (keyof FeaturedSponsor)[] = ['logo']
  dbFilePath: string = app.makePath('content/featured_sponsors/db.json')
}
