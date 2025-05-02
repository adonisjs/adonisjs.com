import 'unpoly'
import Alpine from 'alpinejs'
import { tabs } from 'edge-uikit/tabs'

Alpine.plugin(tabs)
Alpine.start()

import.meta.glob([
  '../../content/team/avatars/*.(jpeg|png|jpg)',
  '../../content/tweets/avatars/*.(jpeg|png|jpg)',
  '../../content/authors/avatars/*.(jpeg|png|jpg)',
  '../../content/blog_posts/articles/*.(jpeg|png|jpg)',
  '../../content/companies_using_adonisjs/logos/*.(jpeg|png|jpg|svg)',
])

up.on('up:location:changed', (event) => {
  event.target.dispatchEvent(new CustomEvent('location-changed', { bubbles: true }))
})

up.on('up:fragment:offline', function (event) {
  window.location.reload()
})
