import app from '@adonisjs/core/services/app'
import BaseCollection from './base.js'
import type sponsors from '../../content/sponsors/db.json'

export type Sponsor = (typeof sponsors)[number]

export default class Sponsors extends BaseCollection<Sponsor> {
  uid: keyof Sponsor = 'sponsor'
  dbFilePath: string = app.makePath('content/sponsors/db.json')

  /**
   * Returns list of all the sponsors sorted by monthly
   * dollars
   */
  async all() {
    const sponsorsList = await super.all()
    return sponsorsList.sort((a, b) => (a.monthlyDollars > b.monthlyDollars ? -1 : 1))
  }

  /**
   * Returns active sponsors sorted by monthly dollars
   */
  async active() {
    const sponsorsList = await this.all()
    return sponsorsList.filter((sponsor) => {
      if (sponsor.privacyLevel !== 'PUBLIC') {
        return false
      }

      if (sponsor.monthlyDollars <= 0) {
        return false
      }

      return true
    })
  }
}
