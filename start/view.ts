import dayjs from 'dayjs'
import edge from 'edge.js'
import edgeUiKit from 'edge-uikit'
import { icons as uiwIcons } from '@iconify-json/uiw'
import { edgeIconify, addCollection } from 'edge-iconify'
import { icons as tablerIcons } from '@iconify-json/tabler'

/**
 * Icons in use
 */
addCollection(uiwIcons)
addCollection(tablerIcons)

/**
 * Edge plugins and globals
 */
edge.use(edgeUiKit)
edge.use(edgeIconify)
edge.global('dayjs', dayjs)
