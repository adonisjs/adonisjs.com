import type { HttpContext } from '@adonisjs/core/http'
import CaseStudies from '../collections/case_studies.js'

export default class CaseStudiesController {
  handle({ view }: HttpContext) {
    return view.render('pages/case_studies', {
      caseStudies: new CaseStudies(),
    })
  }
}
