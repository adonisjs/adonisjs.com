import type { HttpContext } from '@adonisjs/core/http'
import CodeExamples from '../collections/code_examples.js'
import Companies from '../collections/companies.js'
import Tweets from '../collections/tweets.js'
import Sponsors from '../collections/sponsors.js'

export default class PagesController {
  getHome({ view }: HttpContext) {
    return view.render('pages/home', {
      codeExamples: new CodeExamples(),
      companies: new Companies(),
      tweets: new Tweets(),
      sponsors: new Sponsors(),
    })
  }
}
