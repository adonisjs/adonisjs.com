import type { HttpContext } from '@adonisjs/core/http'

import Team from '../collections/team.js'
import Companies from '../collections/companies.js'
import Contributors from '../collections/contributors.js'

export default class AboutController {
  handle({ view }: HttpContext) {
    return view.render('pages/about', {
      companies: new Companies(),
      team: new Team(),
      contributors: new Contributors(),
    })
  }
}
