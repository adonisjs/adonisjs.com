import type { HttpContext } from '@adonisjs/core/http'
import CaseStudies from '../collections/case_studies.js'

export default class CaseStudiesController {
  index({ view }: HttpContext) {
    return view.render('pages/case_studies/list', {
      caseStudies: new CaseStudies(),
    })
  }

  async show({ view, params, response }: HttpContext) {
    const caseStudy = await new CaseStudies().find(params.slug)
    if (!caseStudy) {
      return response.notFound('Case study not found')
    }

    return view.render('pages/case_studies/show', {
      caseStudy,
    })
  }
}
