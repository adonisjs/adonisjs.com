import type { HttpContext } from '@adonisjs/core/http'

import Tweets from '../collections/tweets.js'
import Sponsors from '../collections/sponsors.js'
import Companies from '../collections/companies.js'
import CodeExamples from '../collections/code_examples.js'
import OfficialPackages from '../collections/official_package.js'
import FeaturedSponsors from '../collections/featured_sponsors.js'

export default class HomeController {
  handle({ view }: HttpContext) {
    return view.render('pages/home', {
      codeExamples: new CodeExamples(),
      companies: new Companies(),
      tweets: new Tweets(),
      officialPackages: new OfficialPackages(),
      sponsors: new Sponsors(),
      featuredSponsors: new FeaturedSponsors(),
    })
  }
}
