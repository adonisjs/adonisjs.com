import type { HttpContext } from '@adonisjs/core/http'
import Companies from '../collections/companies.js'
import Team from '../collections/team.js'

export default class AboutController {
  handle({ view }: HttpContext) {
    return view.render('pages/about', {
      companies: new Companies(),
      team: new Team(),
    })
  }
}
