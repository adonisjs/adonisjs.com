import type { HttpContext } from '@adonisjs/core/http'
import SupportBenefits from '../collections/support_benefits.js'

export default class SupportProgramController {
  handle({ view }: HttpContext) {
    return view.render('pages/support', {
      supportBenefits: new SupportBenefits(),
    })
  }
}
