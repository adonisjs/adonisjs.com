import '../css/app.css'
import 'unpoly'
import Alpine from 'alpinejs'
import { tabs } from 'edge-uikit/tabs'

Alpine.plugin(tabs)
Alpine.start()

import.meta.glob([
  '../../content/team/avatars/*.(png|jpg)',
  '../../content/tweets/avatars/*.(jpeg)',
  '../../content/authors/avatars/*.(jpeg)',
])
