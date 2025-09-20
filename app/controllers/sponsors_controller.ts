import type { HttpContext } from '@adonisjs/core/http'
import FeaturedSponsors from '../collections/featured_sponsors.js'

export default class SponsorsController {
  handle({ view }: HttpContext) {
    return view.render('pages/sponsors', {
      featuredSponsors: new FeaturedSponsors(),
    })
  }
}
