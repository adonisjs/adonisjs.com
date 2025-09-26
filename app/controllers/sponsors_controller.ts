import type { HttpContext } from '@adonisjs/core/http'
import FeaturedSponsors from '../collections/featured_sponsors.js'
import Sponsors from '../collections/sponsors.js'

export default class SponsorsController {
  handle({ view }: HttpContext) {
    return view.render('pages/sponsor', {
      sponsors: new Sponsors(),
      featuredSponsors: new FeaturedSponsors(),
    })
  }
}
