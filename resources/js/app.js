import 'unpoly'
import Alpine from 'alpinejs'
import { tabs } from 'edge-uikit/tabs'

Alpine.plugin(tabs)
Alpine.start()

import.meta.glob([
  '../../content/team/avatars/*.(jpeg|png|jpg)',
  '../../content/tweets/avatars/*.(jpeg|png|jpg)',
  '../../content/authors/avatars/*.(jpeg|png|jpg)',
])

up.on('up:location:changed', (event) => {
  event.target.dispatchEvent(new CustomEvent('location-changed', { bubbles: true }))
})
