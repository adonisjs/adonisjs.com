import type { HttpContext } from '@adonisjs/core/http'

export default class AboutController {
  handle({ view }: HttpContext) {
    return view.render('pages/about')
  }
}
